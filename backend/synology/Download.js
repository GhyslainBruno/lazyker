const stringSimilarity = require('string-similarity');
const logger = require('../logs/logger');
const admin = require("firebase-admin");
const db = admin.database();
const fs = require('fs');
const request = require('request');
const {google} = require('googleapis');
const realdebrid = require('../realdebrid/debrid_links');
const connector = require('./Connector');
const usersRef = db.ref("/users");
const gdrive = require('../gdrive/gdrive');

/**
 * Starts a movie download
 * @param linkFromRealdebrid
 * @param title
 * @param user
 * @returns {Promise<void>}
 */
const startMovieDownload = async (linkFromRealdebrid, title, user) => {

    try {
        const syno = await connector.getConnection(user);

        // Get all current downloads in downloadStation
        const currentDownloads = await getCurrentDownloads(syno);

        // const snapshot = await usersRef.child(user.uid).child('/movies').equalTo(title).once('value');
        // const inProgressMovies = snapshot.val();

        let moviesPath = await usersRef.child(user.uid).child('/settings/nas/moviesPath').once('value');
        moviesPath = moviesPath.val();

        // If no download in the folder wanted is present --> start download
        if (currentDownloads.tasks.filter(dl => dl.additional.detail.destination === moviesPath + '/' + title).length === 0) {

            let directoryToStartDownload = await createMovieDir(title, syno, moviesPath);
            directoryToStartDownload = directoryToStartDownload.replace(/^\//,'');

            //   Then --> start download task
            await createMovieDownload(linkFromRealdebrid[0], syno, directoryToStartDownload, user, title);


        } else {
            logger.info('Movie already in download', user)
        }
    } catch(error) {
        throw error;
    }

};

/**
 * Starts a movie download from realdebrid torrent
 * @param linkFromRealdebrid
 * @param title
 * @param user
 * @returns {Promise<*>}
 */
const startMovieDownloadFromRealdebridTorrent = async (linkFromRealdebrid, title, user) => {

    // Getting a connection to synology NAS
    const syno = await connector.getConnection(user);

    const snapshot = await usersRef.child(user.uid).child('/settings/nas/moviesPath').once('value');
    const moviesPath = snapshot.val();

    // Get all current downloads in downloadStation
    const currentDownloads = await getCurrentDownloads(syno);

    // If no download in the folder wanted is present --> start download
    if (currentDownloads.tasks.filter(dl => dl.additional.detail.destination === moviesPath + '/' + title).length === 0) {

        let directoryToStartDownload = await createMovieDir(title, syno, moviesPath);
        directoryToStartDownload = directoryToStartDownload.replace(/^\//,'');

        //   Then --> start download task
        return await createMovieDownload(linkFromRealdebrid, syno, directoryToStartDownload, user, title);


    } else {
        logger.info('Movie already in download', user);
        return null;
    }

};

/**
 * Starts a tv show download
 * @param show
 * @param syno
 * @param user
 * @returns {Promise<void>}
 */
const startDownload = async function(show, syno, user) {

    try {

        // Get all current downloads in downloadStation
        const currentDownloads = await getCurrentDownloads(syno);

        // If YES --> don't do anything |If NO --> Start a download
        //   First --> create directory where to start the download task
        let directoryToStartDownload = await createDir(show, syno);
        directoryToStartDownload = directoryToStartDownload.replace(/^\//,'');

        // If there is NOT already a download to the destination wanted --> start download | IF there is one, don't do anything (for now)
        if (currentDownloads.tasks.filter(dl => dl.additional.detail.destination === directoryToStartDownload).length === 0) {
            //   Then --> start download task
            await createDownload(show, syno, directoryToStartDownload, user);
        } else {
            await logger.info(show.name + ' S' + show.lastSeason + 'E' + show.lastEpisode + ' --> already in download', user)
        }


    } catch (error) {
        await logger.info(error, user);
    }


};

/**
 * Returns a list of all current downloads
 * @param syno
 * @returns {Promise<any>}
 */
function getCurrentDownloads(syno) {

    return new Promise((resolve, reject) => {
        syno.dl.listTasks({'additional': 'detail,transfer'}, function(error, data) {
            if (!error) {
                resolve(data)
            } else {
                reject(error)
            }
        });
    });

}

/**
 * Creates a folder -- CAREFULL -- Only for the TV Shows
 * @param show
 * @param syno
 * @returns {Promise<any>}
 */
// TODO: remove duplicate code for the string of the directory to start download
function createDir(show, syno) {

    return new Promise((resolve, reject) => {
        syno.fs.createFolder({'folder_path': show.path, 'force_parent': true, 'name': 'saison ' + show.lastSeason + '/' + show.name + ' S' + show.lastSeason + 'E' + show.lastEpisode}, function(error, data) {
            if (!error) {
                // Returns the full path of folder created
                resolve(data.folders[0].path)
            } else {
                reject(error)
            }
        })
    })

}

/**
 * Create a directory for a particular movie in movies path
 * @param title
 * @param syno
 * @param moviesPath
 * @returns {Promise<any>}
 */
const createMovieDir = (title, syno, moviesPath) => {
    return new Promise((resolve, reject) => {
        syno.fs.createFolder({'folder_path': moviesPath, 'force_parent': true, 'name': title.replace(':', '')}, function(error, data) {
            if (!error) {
                // Returns the full path of folder created
                resolve(data.folders[0].path)
            } else {
                reject(error)
            }
        })
    })
};

/**
 * Creates a tv show download
 * @param show
 * @param syno
 * @param directoryToStartDownload
 * @param user
 * @returns {Promise<void>}
 */
const createDownload = async (show, syno, directoryToStartDownload, user) =>{

    syno.dl.createTask({'uri': show.unrestrictedLink.download, 'destination': directoryToStartDownload}, async (error, data) => {
        if (!error) {
            await logger.info(show.name + ' S' + show.lastSeason + 'E' + show.lastEpisode + ' --> download STARTED !', user);

            try {
                // Telling db that a new episode has been found (for ui display)
                const showsSnapshot = await usersRef.child(user.uid).child('/shows').once('value');
                const shows = showsSnapshot.val();

                const showTitleWantedToUpdateFromDb = stringSimilarity.findBestMatch(show.name, Object.keys(shows).map(showId => shows[showId].title)).bestMatch.target;

                const showsOrdered = await usersRef.child(user.uid).child('/shows').orderByChild("title").equalTo(showTitleWantedToUpdateFromDb).once('value');
                const showsWanted = showsOrdered.val();
                await usersRef.child(user.uid).child('/shows').child(showsWanted[Object.keys(showsWanted)[0]].id).child('/episode').set('true');

            } catch (error) {
                await logger.info(error, user);
            }

            return data
        } else {
            throw error;
        }
    })

};

/**
 * Creates a movie download
 * @param link
 * @param syno
 * @param directoryToStartDownload
 * @param user
 * @param title
 * @returns {Promise<any>}
 */
const createMovieDownload = (link, syno, directoryToStartDownload, user, title) => {

    return new Promise((resolve, reject) => {
        syno.dl.createTask({'uri': link.download, 'destination': directoryToStartDownload}, async (error, data) => {
            if (!error) {
                logger.info(title + ' --> download STARTED !', user);
                // Removing the movie in database inProgress movies - TODO: find a way if multiple movies with the same title
                // db.push('/movies', db.getData('/movies').filter(movie => movie.title !== title));
                const snapshot = await usersRef.child(user.uid).child('/movies').orderByChild("title").equalTo(title).once('value');
                const inProgressMovie = snapshot.val();

                if (inProgressMovie) {
                    // If several inProgressMovies with the same title, taking the first one
                    const firstInProgressMovieCorrespondig =  inProgressMovie[Object.keys(inProgressMovie)[0]];
                    await usersRef.child(user.uid).child('/movies').child(firstInProgressMovieCorrespondig.id).remove();
                }

                resolve(data)
            } else {
                const snapshot = await usersRef.child(user.uid).child('/movies').orderByChild("title").equalTo(title).once('value');
                const inProgressMovie = snapshot.val();

                // Passing the movie state in error into database
                if (inProgressMovie) {
                    // If several inProgressMovies with the same title, taking the first one
                    const firstInProgressMovieCorrespondig =  inProgressMovie[Object.keys(inProgressMovie)[0]];
                    await usersRef.child(user.uid).child('/movies').child(firstInProgressMovieCorrespondig.id).child('/state').set('error');
                }

                reject(error)
            }
        })
    });

};

/**
 * Resume a synology download
 * @param syno
 * @param downloadId
 * @returns {Promise<any>}
 */
const resumeDownload = (syno, downloadId) => {
    return new Promise((resolve, reject) => {
        syno.dl.resumeTask({'id': downloadId}, function(error, data) {
            if (!error) {
                resolve(data)
            } else {
                reject(error)
            }
        });
    });
};

/**
 * Pause a synology download
 * @param syno
 * @param downloadId
 * @returns {Promise<any>}
 */
const pauseDownload = (syno, downloadId) => {
    return new Promise((resolve, reject) => {
        syno.dl.pauseTask({'id': downloadId}, function(error, data) {
            if (!error) {
                resolve(data)
            } else {
                reject(error)
            }
        });
    });
};

/**
 * Remove a synology download
 * @param syno
 * @param downloadId
 * @returns {Promise<any>}
 */
const removeDownload = (syno, downloadId) => {
    return new Promise((resolve, reject) => {
        syno.dl.deleteTask({'id': downloadId}, function(error, data) {
            if (!error) {
                resolve(data)
            } else {
                reject(error)
            }
        });
    });
};

/**
 * Start the download of a torrent file already downloaded in realdebrid service
 * @param torrent
 * @param name
 * @param user
 * @returns {Promise<void>}
 */
const startRealdebridTorrentDownload = async (unrestrictedLink, name, user) => {
    try {
        // const unrestrictedLink = await realdebrid.unrestricLinkNoDB(torrent.links[0], user);
        return await startMovieDownloadFromRealdebridTorrent(unrestrictedLink, name, user);
    } catch(error) {
        throw error
    }

};

module.exports.startRealdebridTorrentDownload = startRealdebridTorrentDownload;
module.exports.startDownload = startDownload;
module.exports.startMovieDownload = startMovieDownload;
module.exports.getCurrentDownloads = getCurrentDownloads;
module.exports.resumeDownload = resumeDownload;
module.exports.pauseDownload = pauseDownload;
module.exports.removeDownload = removeDownload;