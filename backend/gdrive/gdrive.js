const admin = require("firebase-admin");
const {google} = require('googleapis');
const logger = require('../logs/logger');
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
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

        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[1]);

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
 * Retrieves token stored in database
 * @param user
 * @returns {Promise<admin.database.DataSnapshot>}
 */
const getAccessToken = async user => {
    return await usersRef.child(user.uid).child('/settings/gdrive/token').once('value');
};

module.exports.getGDriveAccessToken = storeGDriveAccessToken;
module.exports.listFiles = listFiles;