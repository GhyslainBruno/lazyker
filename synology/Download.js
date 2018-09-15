const stringSimilarity = require('string-similarity');
const logger = require('../logs/logger');
const Syno = require('syno');
const jsonDB = require('node-json-db');
const db = new jsonDB("database.json", true, true);
const realdebrid = require('../realdebrid/debrid_links');
db.reload();

/**
 * Starts a movie download
 * @param linkFromRealdebrid
 * @param title
 * @returns {Promise<void>}
 */
const startMovieDownload = async (linkFromRealdebrid, title) => {

    db.reload();

    // Create syno object firstly
    const syno = new Syno({
        // Requests protocol : 'http' or 'https' (default: http)
        protocol: db.getData('/configuration/nas/protocol'),
        // DSM host : ip, domain name (default: localhost)
        host: db.getData('/configuration/nas/host'),
        // DSM port : port number (default: 5000)
        port: db.getData('/configuration/nas/port'),
        // DSM User account (required)
        account: db.getData('/configuration/nas/account'),
        // DSM User password (required)
        passwd: db.getData('/configuration/nas/password'),
        // DSM API version (optional, default: 6.0.2)
        apiVersion: '6.0.2'
    });

    // Get all current downloads in downloadStation
    const currentDownloads = await getCurrentDownloads(syno);

    // If no download in the folder wanted is present --> start download
    if (currentDownloads.tasks.filter(dl => dl.additional.detail.destination === db.getData('/configuration/nas/moviesPath') + '/' + title).length === 0) {

        let directoryToStartDownload = await createMovieDir(title, syno, db);
        directoryToStartDownload = directoryToStartDownload.replace(/^\//,'');

        //   Then --> start download task
        await createMovieDownload(linkFromRealdebrid[0], syno, directoryToStartDownload, db, title);


    } else {
        logger.info('Movie already in download')
    }

};

/**
 * Starts a movie download from realdebrid torrent
 * @param linkFromRealdebrid
 * @param title
 * @returns {Promise<void>}
 */
const startMovieDownloadFromRealdebridTorrent = async (linkFromRealdebrid, title) => {

    db.reload();

    // Create syno object firstly
    const syno = new Syno({
        // Requests protocol : 'http' or 'https' (default: http)
        protocol: db.getData('/configuration/nas/protocol'),
        // DSM host : ip, domain name (default: localhost)
        host: db.getData('/configuration/nas/host'),
        // DSM port : port number (default: 5000)
        port: db.getData('/configuration/nas/port'),
        // DSM User account (required)
        account: db.getData('/configuration/nas/account'),
        // DSM User password (required)
        passwd: db.getData('/configuration/nas/password'),
        // DSM API version (optional, default: 6.0.2)
        apiVersion: '6.0.2'
    });

    // Get all current downloads in downloadStation
    const currentDownloads = await getCurrentDownloads(syno);

    // If no download in the folder wanted is present --> start download
    if (currentDownloads.tasks.filter(dl => dl.additional.detail.destination === db.getData('/configuration/nas/moviesPath') + '/' + title).length === 0) {

        let directoryToStartDownload = await createMovieDir(title, syno, db);
        directoryToStartDownload = directoryToStartDownload.replace(/^\//,'');

        //   Then --> start download task
        return await createMovieDownload(linkFromRealdebrid, syno, directoryToStartDownload, db, title);


    } else {
        logger.info('Movie already in download');
        return null;
    }

};

/**
 * Starts a tv show download
 * @param show
 * @param syno
 * @param db
 * @returns {Promise<void>}
 */
const startDownload = async function(show, syno, db) {

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
            await createDownload(show, syno, directoryToStartDownload, db);
        } else {
            logger.info(show.name + ' S' + show.lastSeason + 'E' + show.lastEpisode + ' --> already in download')
        }


    } catch (error) {
        logger.info(error);
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
 *
 * @param title
 * @param syno
 * @param db
 * @returns {Promise<any>}
 */
const createMovieDir = (title, syno, db) => {
    return new Promise((resolve, reject) => {
        syno.fs.createFolder({'folder_path': db.getData('/configuration/nas/moviesPath'), 'force_parent': true, 'name': title.replace(':', '')}, function(error, data) {
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
 *
 * @param show
 * @param syno
 * @param directoryToStartDownload
 * @param db
 * @returns {Promise<any>}
 */
// TODO: if in download but paused --> resume
function createDownload(show, syno, directoryToStartDownload, db) {

    return new Promise((resolve, reject) => {
        syno.dl.createTask({'uri': show.unrestrictedLink.download, 'destination': directoryToStartDownload}, function(error, data) {
            if (!error) {
                logger.info(show.name + ' S' + show.lastSeason + 'E' + show.lastEpisode + ' --> download STARTED !');

                try {
                    // Telling db that a new episode has been found (for ui display)
                    db.reload();
                    const showsInDb = db.getData('/shows');
                    const correspondigShowTitleInDb = stringSimilarity.findBestMatch(show.name, showsInDb.map(showInDb => showInDb.title)).bestMatch.target;
                    // showsInDb.filter(dbShow => dbShow.title === correspondigShowTitleInDb)[0].newEpisodeFound = true;
                    // db.push('/shows', showsInDb);

                    db.data.shows.filter(showDb => showDb.title === correspondigShowTitleInDb)[0].episode = true;
                    db.save();

                } catch (error) {
                    logger.info(error)
                }

                resolve(data)
            } else {
                reject(error)
            }
        })
    });
}

/**
 * Creates a movie download
 * @param link
 * @param syno
 * @param directoryToStartDownload
 * @param db
 * @param title
 * @returns {Promise<any>}
 */
const createMovieDownload = (link, syno, directoryToStartDownload, db, title) => {

    return new Promise((resolve, reject) => {
        syno.dl.createTask({'uri': link.download, 'destination': directoryToStartDownload}, function(error, data) {
            if (!error) {
                logger.info(title + ' --> download STARTED !');
                // Removing the movie in db
                db.push('/movies', db.getData('/movies').filter(movie => movie.title !== title));
                resolve(data)
            } else {
                reject(error)
            }
        })
    });

};

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
 * @returns {Promise<void>}
 */
const startRealdebridTorrentDownload = async (torrent, name) => {
    try {
        const unrestrictedLink = await realdebrid.unrestricLinkNoDB(torrent.links[0]);
        return await startMovieDownloadFromRealdebridTorrent(unrestrictedLink, name);
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