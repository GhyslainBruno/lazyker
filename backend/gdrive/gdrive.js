const admin = require("firebase-admin");
const {google} = require('googleapis');
const logger = require('../logs/logger');
const got = require('got');
// const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const request = require('request');
const credentials = require("./client_secret_348584284-25m9u9qbgmapjd3vtt5oaai7mir5t7vu.apps.googleusercontent.com");

// Get a database reference to our blog
const db = admin.database();
const usersRef = db.ref("/users");

// Trying to increase maxBodyLength to avoid this type of error
// google.options({
//     // All requests made with this object will use these settings unless overridden.
//     maxContentLength: 1000 * 1024 * 1024
// });

/**
 * Gets and stores a Google Drive access token from single time code in database
 * @param code
 * @param user
 * @returns {Promise<void>}
 */
async function storeGDriveAccessToken(code, user) {

    try {

        // Getting credentials of the app from a .json file
        const {client_secret, client_id, redirect_uris} = credentials.web;

        let redirectUrl = '';
        if (process.env.NODE_ENV === 'production') {
            redirectUrl = redirect_uris[2];
        } else {
            redirectUrl = redirect_uris[1];
        }
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUrl);

        // Getting Gdrive token from the single time code emitted from front end
        const response = await oAuth2Client.getToken(code);

        // Storing this token in database
        await usersRef.child(user.uid).child('/settings/gdrive/token').set(response.tokens);

    } catch (error) {
        if (error.message) {
            logger.info("ERROR - Getting Google Drive access - " + error.message, user);
        } else {
            logger.info("ERROR - Getting Google Drive access", user);
        }
    }

}

/**
 * Lists gdrive files - unused for now
 * @param user
 * @returns {Promise<void>}
 */
async function listFiles(user) {

    const params = {
        pageSize: 100,

    };

    const {client_secret, client_id, redirect_uris} = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[1]);
    const token = await getAccessToken(user);
    await oAuth2Client.setCredentials(token.val());

    const drive = await google.drive({version: 'v3', auth: oAuth2Client});

    try {
        const files = await drive.files.list(params);

        // drive.files.list({
        //     pageSize: 10,
        //     fields: 'nextPageToken, files(id, name)',
        // }, (err, res) => {
        //     if (err) return console.log('The API returned an error: ' + err);
        //     const files = res.data.files;
        //     if (files.length) {
        //         console.log('Files:');
        //         files.map((file) => {
        //             console.log(`${file.name} (${file.id})`);
        //         });
        //     } else {
        //         console.log('No files found.');
        //     }
        // });

    } catch (error) {
        console.log(error);
    }

}

/**
 * Returns the Google Drive OAuth2Client
 * @param user
 * @returns {Promise<void>}
 */
async function getOAuth2Client(user) {
    const {client_secret, client_id, redirect_uris} = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[1]);
    const token = await getAccessToken(user);
    await oAuth2Client.setCredentials(token.val());
    return await oAuth2Client;
}

/**
 * Retrieves token stored in database
 * @param user
 * @returns {Promise<admin.database.DataSnapshot>}
 */
const getAccessToken = async user => {
    return await usersRef.child(user.uid).child('/settings/gdrive/token').once('value');
};

/**
 * Starts to download a movie file
 * @param link
 * @param user
 * @param title
 * @returns {Promise<void>}
 */
const downloadMovieFile = async (link, user, title) => {

    // Removing in progress movie in database
    const snapshot = await usersRef.child(user.uid).child('/movies').orderByChild("title").equalTo(title).once('value');
    const inProgressMovie = snapshot.val();

    if (inProgressMovie) {
        // If several inProgressMovies with the same title, taking the first one
        const firstInProgressMovieCorrespondig =  inProgressMovie[Object.keys(inProgressMovie)[0]];
        await usersRef.child(user.uid).child('/movies').child(firstInProgressMovieCorrespondig.id).remove();
    }

    const oAuth2Client = await getOAuth2Client(user);
    const moviesGdriveFolder = await usersRef.child(user.uid).child('/settings/gdrive/moviesGdriveFolder').once('value');

    const drive = google.drive({
        version: 'v3',
        auth: oAuth2Client
    });

    const movieFolderCreated = await createMovieFolder(drive, moviesGdriveFolder.val().moviesGdriveFolderId, user, title);

    // Creating (initializing) the download into database
    const downloadKey = await usersRef.child(user.uid).child('/settings/downloads').push().key;

    const metadata = {
        mimeType: link.mimeType,
        name: link.filename,
        parents: [movieFolderCreated.id]
    };

    const options = {
        headers: {
            'Authorization': 'Bearer ' + oAuth2Client.credentials.access_token,
            'Content-Type': 'application/json; charset=UTF-8',
            // Find a way to know the length of the init request - doc said it is mandatory
            // 'Content-Length': new Buffer(JSON.stringify(self.metadata)).length,
            'X-Upload-Content-Length': link.filesize,
            'X-Upload-Content-Type': link.link.mimeType
        },
        body: JSON.stringify(metadata)
    };

    // Initialize the upload - getting an url where to put chunks to
    try {
        const response = await got('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', options);
        const urlToPut = response.headers.location;
        let percentageUploaded = 0;

        // time to use to calculate the speed of downloading => uploading media
        let timeBefore = Date.now();
        let bytesUploaded = 0;
        let lastChunkSize = 0;
        let speed = 0;

        // Updating speed value every 5 seconds
        // TODO use 1024 instead of 1000 when it is needed
        const updateSpeed = setInterval(() => {

            // Getting the time interval in seconds between 2 chunks received
            const deltaTime = (Date.now() - timeBefore) / 1000;
            timeBefore = Date.now();

            // 1 byte = 1 octet = 8 bits => 1Mo = 1e6 octets = 1Mbytes
            const chunkSize = (bytesUploaded - lastChunkSize)/ 1000000;

            // Should be in Mega Octets / seconds (Mo/s)
            // Updating speed value here
            if (deltaTime > 0) {
                speed = (chunkSize / deltaTime);
            }

            usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({speed: speed})
                .catch(error => {
                    throw error
                });

            lastChunkSize = bytesUploaded;
            bytesUploaded = 0;

        }, 3000);

        const downloadStream = got.stream(link.download);

        // Creating download stream
        downloadStream
            .on('downloadProgress', async progress => {

                // Updating this variable to display speed
                bytesUploaded = progress.transferred;

                // Update progress into db only if the percentage is more than 1% each time - to avoid to much requests
                const percentage = Math.round(progress.transferred*100/link.filesize);
                if (percentage > percentageUploaded) {
                    percentageUploaded = percentage;
                    // Updating progress into database
                    await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({size_downloaded: progress.transferred});
                }

            });

        // Creating the download task into database
        await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({
            status: 'downloading',
            size: link.filesize,
            size_downloaded: 0,
            speed: 0,
            title: title,
            destination: movieFolderCreated.name,
            id: downloadKey,
        });

        let lastEvent = '';
        const downloadEventReference = usersRef.child(user.uid).child('/settings/downloads/' + downloadKey + '/event');

        // Managing download task using stream events (resume, pause, destroy)
        downloadEventReference.on('value', async snapshot => {

            if (snapshot.val() === 'pause') {
                downloadStream.pause();
                await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({
                    status: 'paused'
                });
            }

            if (snapshot.val() === 'destroy') {
                downloadStream.destroy();
                clearInterval(updateSpeed);
                lastEvent = 'destroy';
                await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).remove();
                // Delete movie folder previously created if download is destroyed
                await deleteMovieFolder(drive, movieFolderCreated);
            }

            if (snapshot.val() === 'resume') {
                downloadStream.resume();
                await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({
                    status: 'downloading'
                });
            }
        });

        // Uploading the file to Google Drive
        await got.put(urlToPut, {
            headers: {
                'Content-Length': link.filesize
            },
            body: downloadStream
        });

        // Removing the setInterval used to display download/upload speed
        clearInterval(updateSpeed);

        // Upload done after here
        if (lastEvent !== 'destroy') {
            await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({status: 'finished'});
            // Detaching event listener (to avoid memory leak)
            downloadEventReference.off();
        }

    } catch(error) {
        console.log(error);
    }

};

/**
 * Creates a movie folder in Google Drive, return id of folder
 * @param drive
 * @param parentFolderId
 * @param user
 * @param title
 * @returns {Promise<*>}
 */
const createMovieFolder = async (drive, parentFolderId, user, title) => {

    try {
        const fileMetadata = {
            name: title,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId]
        };

        const folderCreated = await drive.files.create({
            resource: fileMetadata
        });

        return folderCreated.data;
    } catch(error) {
        throw error;
    }

};

/**
 * Deletes a particular folder
 * @param drive
 * @param folder
 * @returns {Promise<*>}
 */
const deleteMovieFolder = async (drive, folder) => {
    try {

        const folderDeleted = await drive.files.delete({
            fileId: folder.id
        });

        return folderDeleted.data;
    } catch(error) {
        throw error;
    }
};

/**
 * Passes all Google Drive downloads in error - ! Use ONLY at first launch of the app, at boot !
 */
const setAllGdriveDownloadsInError = async () => {
    let users = await usersRef.once('value');
    users = users.val();

    Object.keys(users).forEach(async userKey => {
        const downloads = users[userKey].settings.downloads;

        if (downloads !== undefined) {
            if (Object.keys(downloads).length > 0) {
                Object.keys(downloads).map(async downloadKey => {
                    await usersRef.child(userKey).child('/settings/downloads').child(downloadKey).update({
                        status: 'error'
                    })
                })
            }
        }
    })
};

module.exports.getGDriveAccessToken = storeGDriveAccessToken;
module.exports.listFiles = listFiles;
module.exports.getOAuth2Client = getOAuth2Client;
module.exports.downloadMovieFile = downloadMovieFile;
module.exports.setAllgdriveDownloadsInError = setAllGdriveDownloadsInError;