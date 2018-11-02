const admin = require("firebase-admin");
const {google} = require('googleapis');
const logger = require('../logs/logger');
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const request = require('request');
const credentials = require("./client_secret_348584284-25m9u9qbgmapjd3vtt5oaai7mir5t7vu.apps.googleusercontent.com");

// Get a database reference to our blog
const db = admin.database();
const usersRef = db.ref("/users");

/**
 * Gets and stores a Google Drive access token from single time code in database
 * @param code
 * @returns {Promise<void>}
 */
async function storeGDriveAccessToken(code, user) {

    try {

        // Getting credentials of the app from a .json file
        const {client_secret, client_id, redirect_uris} = credentials.web;

        let redirectUrl = '';
        if (process.env.NODE_ENV === 'production') {
            redirectUrl = redirect_uris[0];
        } else {
            redirectUrl = redirect_uris[1];
        }
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUrl);

        // Getting Gdrive token from the single time code emitted from front end
        const response = await oAuth2Client.getToken(code);

        // Storing this token in database
        await usersRef.child(user.uid).child('/settings/gdrive/token').set(response.tokens);

    } catch (error) {
        logger.info("ERROR - Getting Google Drive access", user);
    }

}

/**
 * Lists gdrive files
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

        console.log('foo');
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

    request
        .get(link.download)
        .on('response', async function(response) {

            await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({
                status: 'downloading',
                size: link.filesize,
                size_downloaded: 0,
                title: title,
                destination: movieFolderCreated.name,
                id: downloadKey,
            });

            let lastEvent = '';

            usersRef.child(user.uid).child('/settings/downloads/' + downloadKey + '/event').on('value', async snapshot => {
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

            const res = await drive.files.create({
                resource: {
                    name: link.filename,
                    mimeType: link.mimeType,
                    parents: [movieFolderCreated.id]
                },
                media: {
                    mimeType: link.mimeType,
                    body: response
                }
            }, {
                // Use the `onUploadProgress` event from Axios to track the
                // number of bytes uploaded to this point.
                onUploadProgress: async evt => {

                    const percentage = Math.round(evt.bytesRead*100/link.filesize);

                    if (percentage > percentageUploaded) {
                        percentageUploaded = percentage;
                        await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({size_downloaded: evt.bytesRead});
                    }
                },
            });

            if (lastEvent !== 'destroy') {
                await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({status: 'finished'});
            }

        })
        .on('error', async error => {
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

module.exports.getGDriveAccessToken = storeGDriveAccessToken;
module.exports.listFiles = listFiles;
module.exports.getOAuth2Client = getOAuth2Client;
module.exports.downloadMovieFile = downloadMovieFile;