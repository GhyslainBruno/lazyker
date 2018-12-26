const admin = require("firebase-admin");
const {google} = require('googleapis');
const logger = require('../logs/logger');
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
    let percentageUploaded = 0;

    const drive = google.drive({
        version: 'v3',
        auth: oAuth2Client
    });

    const movieFolderCreated = await createMovieFolder(drive, moviesGdriveFolder.val().moviesGdriveFolderId, user, title);

    // Creating (initializing) the download into database
    const downloadKey = await usersRef.child(user.uid).child('/settings/downloads').push().key;

    // time to use to calculate the speed of downloading => uploading media
    let timeBefore = Date.now();
    let bytesUploaded = 0;

    request
        .get(link.download)
        .on('response', async function(response) {

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

            downloadEventReference.on('value', async snapshot => {
                if (snapshot.val() === 'pause') {
                    response.pause();
                    await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({
                        status: 'paused'
                    });
                }

                // TODO here destroy folder created for the download IF the download is not done
                if (snapshot.val() === 'destroy') {
                    response.destroy();
                    lastEvent = 'destroy';
                    await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).remove();
                }

                if (snapshot.val() === 'resume') {
                    response.resume();
                    await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({
                        status: 'downloading'
                    });
                }
            });

            await drive.files.create({
                resource: {
                    name: link.filename,
                    mimeType: link.mimeType,
                    parents: [movieFolderCreated.id]
                },
                media: {
                    mimeType: link.mimeType,
                    body: response,
                    resumable: true
                }
            }, {
                // Use the `onUploadProgress` event from Axios to track the
                // maxContentLength: 5000 * 1024 * 1024,
                // maxBodyLength: 5000 * 1024 * 1024,
                // Trying to set this property to avoid maxContentLength error :
                // https://github.com/googleapis/google-api-nodejs-client/issues/1354
                maxRedirects: 0,
                // number of bytes uploaded to this point.
                onUploadProgress: async evt => {

                    // Getting the time interval in seconds between 2 chunks received
                    const deltaTime = (Date.now() - timeBefore) / 1000;
                    timeBefore = Date.now();

                    // 1 bytes = 1 octet = 8 bits => 1mo = 1e6 octet
                    const chunkSize = (evt.bytesRead - bytesUploaded) / 1000000;
                    bytesUploaded = evt.bytesRead;

                    // Should be in Mega Octets / seconds (Mo/s)
                    const speed = chunkSize / deltaTime;
                    const percentage = Math.round(evt.bytesRead*100/link.filesize);

                    await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({speed: speed});

                    if (percentage > percentageUploaded) {
                        percentageUploaded = percentage;
                        await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({size_downloaded: evt.bytesRead, speed: speed});
                    }
                },
            }, async (err, file) => {
                if (err) {
                    // Handle error
                    console.error(err);
                    await logger.info("ERROR - Downloading movie " + err.message, user);
                    await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({status: 'error'});
                } else {
                    console.log("Uploaded: " + file.data.id);
                    await logger.info("End of download - " + file, user);
                    await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({status: 'finished'});
                }
            });

            if (lastEvent !== 'destroy' && lastEvent !== "") {
                await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({status: 'finished'});
                // Detaching event listener (to avoid memory leak)
                downloadEventReference.off();
            }

        })
        .on('error', async error => {
            await logger.info("ERROR - " + error, user);
            await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({status: 'error'});
        });
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