const admin = require("firebase-admin");
const {google} = require('googleapis');
const logger = require('../logs/logger');
const got = require('got');
const utils = require('../utils/downloads/MultipleDownloads');
// const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const request = require('request');
const credentials = require("./client_secret_348584284-25m9u9qbgmapjd3vtt5oaai7mir5t7vu.apps.googleusercontent.com");

// Get a database reference to our blog
const db = admin.database();
const usersRef = db.ref("/users");

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
            redirectUrl = redirect_uris[1];
        } else {
            redirectUrl = redirect_uris[0];
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
 * Lists gdrive files
 * @param user
 * @param parent
 * @param query
 * @returns {Promise<*>}
 */
async function getFilesList(user, parent, query = `'${parent.tvShowsGdriveFolderId || parent.id}' in parents and trashed = false`) {

    const params = {
        // Using this to specify only folders
        // mimeType: 'application/vnd.google-apps.folder',
        // Getting some examples of search queries here https://developers.google.com/drive/api/v3/search-parameters
        // If a query is specified -> using it, using this one otherwise
        orderBy: 'name',
        q: query
        // parents: [parent.tvShowsGdriveFolderId]
    };

    const {client_secret, client_id, redirect_uris} = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[1]);
    const token = await getAccessToken(user);
    await oAuth2Client.setCredentials(token.val());

    const drive = await google.drive({version: 'v3', auth: oAuth2Client});

    try {
        const files = await drive.files.list(params);
        return files.data.files
    } catch (error) {
        throw error;
    }

}
module.exports.getFilesList = getFilesList;

/**
 * Returns true if the folder doesn't contain any child / false otherwise
 * @param user
 * @param folder
 * @returns {Promise<boolean>}
 */
isFolderEmpty = async (user, folder) => {
    const files = await getFilesList(user, folder);
    return files.length === 0;
};
module.exports.isFolderEmpty = isFolderEmpty;

/**
 * eturns true if the parent folder contains the file / false otherwise
 * @param user
 * @param parent
 * @param childFolderTitle
 * @returns {Promise<boolean>}
 */
doesFolderContainsThisFolder = async (user, parent, childFolderTitle) => {
    const files = await getFilesList(user, parent, `mimeType = 'application/vnd.google-apps.folder' and name contains '${childFolderTitle.replace(/[']/g, '\\$&')}' and '${parent.tvShowsGdriveFolderId || parent.id}' in parents and trashed = false`);
    return files.length > 0
};

/**
 * Returns a folder by specifying its parent and its title
 * @param user
 * @param parent
 * @param childFolderTitle
 * @returns {Promise<*>}
 */
getFolder = async (user, parent, childFolderTitle) => {
    return await getFilesList(user, parent, `mimeType = 'application/vnd.google-apps.folder' and name contains '${childFolderTitle.replace(/[']/g, '\\$&')}' and '${parent.tvShowsGdriveFolderId || parent.id}' in parents and trashed = false`);
};

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
 * @param torrentInfos
 * @param unrestrictedLink
 * @param res
 * @returns {Promise<void>}
 */
const downloadMovieFile = async (link, user, title, torrentInfos, unrestrictedLink, res) => {

    let fileTitle = title;

    // Removing in progress movie in database
    const snapshot = await usersRef.child(user.uid).child('/movies').orderByChild("title").equalTo(title).once('value');
    const inProgressMovie = snapshot.val();

    if (inProgressMovie) {
        // If several inProgressMovies with the same title, taking the first one
        const firstInProgressMovieCorresponding =  inProgressMovie[Object.keys(inProgressMovie)[0]];
        await usersRef.child(user.uid).child('/movies').child(firstInProgressMovieCorresponding.id).remove();
    }

    const oAuth2Client = await getOAuth2Client(user);

    const drive = google.drive({
        version: 'v3',
        auth: oAuth2Client
    });

    let folderCreated = {};

    if (torrentInfos) {
        if (torrentInfos.mediaInfos) {
            if (torrentInfos.mediaInfos.isShow) {
                const tvShowsGdriveFolder = await usersRef.child(user.uid).child('/settings/gdrive/tvShowsGdriveFolder').once('value');
                folderCreated = await createShowEpisodeFolder(drive, tvShowsGdriveFolder.val(), user, torrentInfos.mediaInfos, unrestrictedLink);
            } else {
                const moviesGdriveFolder = await usersRef.child(user.uid).child('/settings/gdrive/moviesGdriveFolder').once('value');
                folderCreated = await createFolder(drive, moviesGdriveFolder.val(), torrentInfos.mediaInfos.title);
                fileTitle = torrentInfos.mediaInfos.title;
            }
        } else {
            const moviesGdriveFolder = await usersRef.child(user.uid).child('/settings/gdrive/moviesGdriveFolder').once('value');
            folderCreated = await createFolder(drive, moviesGdriveFolder.val(), title);
        }
    } else {
        const moviesGdriveFolder = await usersRef.child(user.uid).child('/settings/gdrive/moviesGdriveFolder').once('value');
        folderCreated = await createFolder(drive, moviesGdriveFolder.val(), title);
    }

    // Creating (initializing) the download into database
    const downloadKey = await usersRef.child(user.uid).child('/settings/downloads').push().key;

    const metadata = {
        mimeType: link.mimeType,
        name: link.filename,
        parents: [folderCreated.id]
    };

    // Get a valid access token using stored token - nodejs google drive api handles an automatic refresh since a refresh token + expiry date is delivered in setCredentials https://github.com/googleapis/google-api-nodejs-client#first-example
    const validAccessToken = await oAuth2Client.getAccessToken();

    const options = {
        headers: {
            'Authorization': 'Bearer ' + validAccessToken.token,
            'Content-Type': 'application/json; charset=UTF-8',
            // Find a way to know the length of the init request - doc said it is mandatory
            // 'Content-Length': new Buffer(JSON.stringify(self.metadata)).length,
            'X-Upload-Content-Length': link.filesize,
            'X-Upload-Content-Type': link.mimeType
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
            title: fileTitle,
            destination: folderCreated.name,
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
                await deleteMovieFolder(drive, folderCreated);
            }

            if (snapshot.val() === 'resume') {
                downloadStream.resume();
                await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({
                    status: 'downloading'
                });
            }
        });

        if (utils.isFirstTime()) {
            utils.checkPassage();
            res.send({
                message: 'ok'
            });
        }


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
            await usersRef.child(user.uid).child('/settings/downloads/' + downloadKey).update({speed: 0});
            // Detaching event listener (to avoid memory leak)
            downloadEventReference.off();
        }

    } catch(error) {

        if (error.statusCode === 401) {
            res.status(401).send({
                message: 'Error with authorization - check console'
            });
            await logger.info(error.message + ' - try to relink lazyker to you google drive account in settings', user);
        } else {
            await logger.info(error.message, user);
        }

    }

};

/**
 * Creates a folder in Google Drive, return id of folder
 * @param drive
 * @param parentFolder
 * @param newFolderName
 * @returns {Promise<*>}
 */
const createFolder = async (drive, parentFolder, newFolderName) => {

    try {
        const fileMetadata = {
            name: newFolderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolder.moviesGdriveFolderId || parentFolder.id || parentFolder.tvShowsGdriveFolderId]
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
 * Creates a folder for the episode of the tv show wanted (with parents) => returns an id
 * @param drive
 * @param parent
 * @param user
 * @param mediaInfos
 * @param unrestrictedLink
 * @returns {Promise<void>}
 */
const createShowEpisodeFolder = async (drive, parent, user, mediaInfos, unrestrictedLink) => {
    try {

        // const test = await doesFolderContainsThisFolder(user, parent, `'${mediaInfos.name} S${mediaInfos.lastSeason}E${mediaInfos.lastEpisode}'`);

        // Does the tv shows root folder contains a folder with the title of the tv show ? (if true -> use it otherwise create it and use it
        if (await doesFolderContainsThisFolder(user, parent, `${mediaInfos.name}`)) {

            // Does tv show folder contains a season folder (as is : "season 09) ? if true -> use it, otherwise, create it and use it
            let tvShowFolder = await getFolder(user, parent, `${mediaInfos.name}`);
            tvShowFolder = tvShowFolder[0];
            if (await doesFolderContainsThisFolder(user, tvShowFolder, `season ${mediaInfos.lastSeason}`)) {

                // Does tv shpw folder contains a folder of the form "Vikings S05E20" ? If so -> use it, otherwise create it and use it
                let seasonFolder = await getFolder(user, tvShowFolder, `season ${mediaInfos.lastSeason}`);
                seasonFolder = seasonFolder[0];
                if (await doesFolderContainsThisFolder(user, seasonFolder, `${mediaInfos.name} S${mediaInfos.lastSeason}E${mediaInfos.lastEpisode}`)) {

                    // Returning episode folder
                    const episodeFolder = await getFolder(user, seasonFolder, `${mediaInfos.name} S${mediaInfos.lastSeason}E${mediaInfos.lastEpisode}`)
                    return episodeFolder[0];

                } else {

                    if (mediaInfos.lastEpisode) {
                        // Creating new episode folder and returning it
                        return await createFolder(drive, seasonFolder, `${mediaInfos.name} S${mediaInfos.lastSeason}E${mediaInfos.lastEpisode}`);
                    } else {
                        // Creating new episode folder and returning it - when no episode number is found (typically a multiple torrent files from realdebrid) -> using filename without extension
                        return await createFolder(drive, seasonFolder, `${unrestrictedLink.filename.match(/(.*)\.[^.]+$/)[1]}`);
                    }

                }

            } else {

                // Creating new season folder
                const newSeasonFolder = await createFolder(drive, tvShowFolder, `season ${mediaInfos.lastSeason}`);

                if (mediaInfos.lastEpisode) {
                    // Creating new episode folder and returning it
                    return await createFolder(drive, newSeasonFolder, `${mediaInfos.name} S${mediaInfos.lastSeason}E${mediaInfos.lastEpisode}`);
                } else {
                    // Creating new episode folder and returning it - when no episode number is found (typically a multiple torrent files from realdebrid) -> using filename without extension
                    return await createFolder(drive, newSeasonFolder, `${unrestrictedLink.filename.match(/(.*)\.[^.]+$/)[1]}`);
                }

            }

        } else {
            // Here it means that th shows root folder doesn't even contain tv show folder

            // Creating a new folder for this tv show
            const newShowFolder = await createFolder(drive, parent, `${mediaInfos.name}`);

            // Creating a new season folder for this tv show
            const newSeasonFolder = await createFolder(drive, newShowFolder, `season ${mediaInfos.lastSeason}`);

            if (mediaInfos.lastEpisode) {
                // Creating new episode folder and returning it
                return await createFolder(drive, newSeasonFolder, `${mediaInfos.name} S${mediaInfos.lastSeason}E${mediaInfos.lastEpisode}`);
            } else {
                // Creating new episode folder and returning it - when no episode number is found (typically a multiple torrent files from realdebrid) -> using filename without extension
                return await createFolder(drive, newSeasonFolder, `${unrestrictedLink.filename.match(/(.*)\.[^.]+$/)[1]}`);
            }

        }

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
module.exports.getOAuth2Client = getOAuth2Client;
module.exports.downloadMovieFile = downloadMovieFile;
module.exports.setAllgdriveDownloadsInError = setAllGdriveDownloadsInError;
