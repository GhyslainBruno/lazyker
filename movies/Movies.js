const ZTScrapper = require('./scappers/zonetelechargement/zonetelechargement');
const ZTScrapperlol = require('./scappers/zonetelechargementlol/zonetelechargementlol');
const EDScrapper = require('./scappers/extremedownload/extremedownload');
const dlprotectlol = require('./scappers/zonetelechargementlol/dlprotect1co');
const dlprotect = require('./scappers/zonetelechargement/dlprotect1com');
const edprotect = require('./scappers/extremedownload/edprotect');
const realdebrid = require('../realdebrid/debrid_links');
const download = require('../synology/download');
const logger = require('../logs/logger');
const pMap = require('p-map');
const ygg = require('./torrents/ygg/ygg');
const torrent9 = require('./torrents/torrents9/torrent9');

/**
 * Get a list of torrents (title and url of the page to find the actual torrent) - aggregator
 * @param title
 * @returns {Promise<void>}
 */
const getTorrentsList = async title => {

    // TODO: use more providers
    // const torrentsList = await ygg.getTorrentsList(title);
    const torrentsList = await torrent9.getTorrentsList(title);

    return torrentsList
};

/**
 * Download torrent file aggregator
 * @param url
 * @returns {Promise<void>}
 */
const downloadTorrentFile = async (url, user) => {
    // TODO: use more providers
    const torrentsList = await torrent9.downloadTorrentFile(url, user);

    return torrentsList
};

/**
 * Get all results for a movie search in ZoneTelechargement
 * @param title
 * @returns {Promise<T>}
 */
const getUrls = async title => {

    const providersPromises = [
        ZTScrapper.getUrls(title),
        // EDScrapper.getUrls(title)
    ];

    return await pMap(providersPromises, async providerUrls => {
        return providerUrls;
    }, {concurrency: 2});
};

/**
 * Returns all qualities for a ZoneTelechargement movie
 * @param movie
 * @param title
 * @returns {Promise<*>}
 */
const getQualities = async (movie, title, provider) => {

    switch (provider) {
        case 'zonetelechargementlol':
            return await ZTScrapperlol.getMovieQualities(movie, title);
            break;
        case 'zonetelechargement':
            return await ZTScrapper.getMovieQualities(movie, title);
            break;
        case 'extremedownload':
            return await EDScrapper.getMovieQualities(title);
            break;
        default:
            throw new Error('bad provider');
            break;
    }
};

/**
 * Returns download protected links
 * @param link
 * @returns {Promise<*>}
 */
const getDownloadLinks = async link => {
    return await ZTScrapper.getDownloadLinks(link)
};

/**
 * Returns unprotected links - TODO use several providers also here (that's the point)
 * @param host
 * @param db
 * @returns {Promise<*>}
 */
const getUnprotectedLinks = async (host, db) => {
    return await realdebrid.getUnrestrictedLinks(await dlprotect.getUnprotectedLinks(host), db)
};

/**
 * Starts a movie download
 * @param qualityLink
 * @param title
 * @param provider
 * @param db
 * @returns {Promise<void>}
 */
const startDownloadMovieTask = async (qualityLink, title, provider, db) => {

    let hosts = {};

    switch (provider) {
        case 'zonetelechargementlol':
            hosts = await ZTScrapperlol.getDownloadLinks(qualityLink);
            break;
        case 'zonetelechargement':
            hosts = await ZTScrapper.getDownloadLinks(qualityLink);
            break;
        case 'extremedownload':
            hosts = await EDScrapper.getDownloadLinks(qualityLink);
            break;
        default:
            throw new Error('bad provider');
            break;
    }


    // if no premium link is found
    if (hosts.premium.length === 0) {

        let linkToDownload = '';

        // Doing this to firstly check when there is an only one link (preferable)
        const freeHostsOrdered = hosts.free.sort((a, b) => {
            return a.links.length - b.links.length
        });

        for (let host in freeHostsOrdered) {
            try {

                linkToDownload = await realdebrid.getUnrestrictedLinks(await unprotectLinks(freeHostsOrdered[host].links, provider), db);

                if (linkToDownload !== '' && linkToDownload !== undefined) {
                    break;
                }

            } catch(error) {
                logger.info('ERROR ' + host + error)
            }
        }

        if (linkToDownload === '') {
            // Set movie in progress (in db) to movie in error
            const moviesInDb = db.getData('/movies').filter(movie => movie.title !== title);
            const movieInErrorToPushInBn = db.getData('/movies').filter(movie => movie.title === title)[0];
            movieInErrorToPushInBn.state = 'error';
            movieInErrorToPushInBn.title = title;

            moviesInDb.push(movieInErrorToPushInBn);
            db.push('/movies', moviesInDb)
        } else {
            return await download.startMovieDownload(linkToDownload, title);
        }


    } else {
        // if premium links are found
        // Check firstly premium links | and if no one is a good one --> check the free ones

        let linkToDownload = '';

        // Doing this to firstly check when there is an only one link (preferable)
        const premiumHostsOrdered = hosts.premium.sort((a, b) => {
            return a.links.length - b.links.length
        });

        for (let host in premiumHostsOrdered) {
            try {

                linkToDownload = await realdebrid.getUnrestrictedLinks(await unprotectLinks(premiumHostsOrdered[host].links, provider), db);

                if (linkToDownload !== '' && linkToDownload !== undefined) {
                    break;
                }

            } catch(error) {
                logger.info('ERROR ' + host + error)
            }
        }

        if (linkToDownload === '') {
            // Set movie in progress (in db) to movie in error
            const moviesInDb = db.getData('/movies').filter(movie => movie.title !== title);
            const movieInErrorToPushInBn = db.getData('/movies').filter(movie => movie.title === title)[0];
            movieInErrorToPushInBn.state = 'error';
            movieInErrorToPushInBn.title = title;

            moviesInDb.push(movieInErrorToPushInBn);
            db.push('/movies', moviesInDb)
        } else {
            return await download.startMovieDownload(linkToDownload, title);
        }

    }

};

const unprotectLinks = async (links, provider) => {
    switch (provider) {
        case 'zonetelechargementlol':
            return await dlprotect.getUnprotectedLinks(links);
            break;
        case 'zonetelechargement':
            return await dlprotect.getUnprotectedLinks(links);
            break;
        case 'extremedownload':
            return await edprotect.getUnprotectedLinks(links);
            break;
        default:
            throw new Error('bad provider');
            break;
    }
};

module.exports.downloadTorrentFile = downloadTorrentFile;
module.exports.getTorrentsList = getTorrentsList;
module.exports.getUrls = getUrls;
module.exports.getQualities = getQualities;
module.exports.getDownloadLinks = getDownloadLinks;
module.exports.getUnprotectedLinks = getUnprotectedLinks;
module.exports.startDownloadMovieTask = startDownloadMovieTask;