const ZTScrapper = require('../scrappers/zonetelechargement/zonetelechargement');
const ZTScrapperlol = require('../scrappers/zonetelechargementlol/zonetelechargementlol');
const EDScrapper = require('../scrappers/extremedownload/extremedownload');
const dlprotectlol = require('../scrappers/zonetelechargementlol/dlprotect1co');
const dlprotect = require('../scrappers/zonetelechargement/dlprotect1com');
const edprotect = require('../scrappers/extremedownload/edprotect');
const realdebrid = require('../debriders/realdebrid/debrid_links');
// const download = require('../synology/Download');
const download = require('../downloads/downloader');
const logger = require('../logs/logger');
const pMap = require('p-map');
const ygg = require('../scrappers/ygg/ygg');
const torrent9 = require('../scrappers/torrents9/torrent9');

// Using firebase
const admin = require("firebase-admin");
const db = admin.database();
const usersRef = db.ref("/users");

/**
 * Get a list of torrents (title and url of the page to find the actual torrent) - aggregator
 * @param title
 * @returns {Promise<void>}
 */
export const getTorrentsList = async (title: any) => {

    const providersPromises = [
        ygg.getTorrentsList(title),
        // torrent9.getTorrentsList(title)
    ];

        return await pMap(providersPromises, async (providerUrls: any) => {
        return providerUrls;
    }, {concurrency: 2});

};

/**
 * Download torrent file aggregator
 * @param url
 * @param provider
 * @param title
 * @param id
 * @param infos
 * @param user
 */
export const downloadTorrentFile = async (url: string, provider: any, title: string, id: any, infos: any, user: any) => {

    try {

        switch (provider) {
            case 'ygg' :
                await ygg.downloadTorrentFile(url, user, { ...infos, isShow: false });
                break;
            case 'torrent9':
                await torrent9.downloadTorrentFile(url, user, {title: title, isShow: false});
                break;
            default:
                throw new Error('bad provider');
        }

        const snapshot = await usersRef.child(user.uid).child('/movies').orderByChild("title").equalTo(title).once('value');
        const inProgressMovie = snapshot.val();

        if (inProgressMovie) {
            // If several inProgressMovies with the same title, taking the first one
            const firstInProgressMovieCorrespondig =  inProgressMovie[Object.keys(inProgressMovie)[0]];
            await usersRef.child(user.uid).child('/movies').child(firstInProgressMovieCorrespondig.id).remove();
        }

    } catch(error) {
        // Set movie in progress state to movie in error (in db)
        const snapshot = await usersRef.child(user.uid).child('/movies').orderByChild("title").equalTo(title).once('value');
        const inProgressMovie = snapshot.val();

        if (inProgressMovie) {
            // If several inProgressMovies with the same title, taking the first one
            const firstInProgressMovieCorrespondig =  inProgressMovie[Object.keys(inProgressMovie)[0]];
            await usersRef.child(user.uid).child('/movies').child(firstInProgressMovieCorrespondig.id).child('/state').set('error');
        }
    }

};

/**
 * Get all results for a movie search in ZoneTelechargement
 * @param title
 * @returns {Promise<T>}
 */
export const getUrls = async (title: any) => {

    const providersPromises = [
        ZTScrapper.getUrls(title),
        // EDScrapper.getUrls(title)
    ];

    return await pMap(providersPromises, async (providerUrls: any) => {
        return providerUrls;
    }, {concurrency: 2});
};

/**
 * Returns all qualities for a ZoneTelechargement movie
 * @param movie
 * @param title
 * @returns {Promise<*>}
 */
export const getQualities = async (movie: any, title: any, provider: any) => {

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
export const getDownloadLinks = async (link: any) => {
    return await ZTScrapper.getDownloadLinks(link)
};

/**
 * Returns unprotected links - TODO use several providers also here (that's the point)
 * @param host
 * @param db
 * @returns {Promise<*>}
 */
export const getUnprotectedLinks = async (host: any, db: any) => {
    return await realdebrid.getUnrestrictedLinks(await dlprotect.getUnprotectedLinks(host), db)
};

/**
 * Starts a movie download
 * @param qualityLink
 * @param title
 * @param provider
 * @param user
 * @returns {Promise<void>}
 */
// export const startDownloadMovieTask = async (qualityLink: any, title: any, provider: any, user: any) => {
//
//     let hosts = {};
//
//     switch (provider) {
//         case 'zonetelechargementlol':
//             hosts = await ZTScrapperlol.getDownloadLinks(qualityLink);
//             break;
//         case 'zonetelechargement':
//             hosts = await ZTScrapper.getDownloadLinks(qualityLink);
//             break;
//         case 'extremedownload':
//             hosts = await EDScrapper.getDownloadLinks(qualityLink);
//             break;
//         default:
//             throw new Error('bad provider');
//             break;
//     }
//
//
//     // if no premium link is found
//     if (hosts.premium.length === 0) {
//
//         let linkToDownload = '';
//
//         // Doing this to firstly check when there is an only one link (preferable)
//         const freeHostsOrdered = hosts.free.sort((a, b) => {
//             return a.links.length - b.links.length
//         });
//
//         for (let host in freeHostsOrdered) {
//             try {
//
//                 linkToDownload = await realdebrid.getUnrestrictedLinks(await unprotectLinks(freeHostsOrdered[host].links, provider), user);
//
//                 if (linkToDownload !== '' && linkToDownload !== undefined) {
//                     break;
//                 }
//
//             } catch(error) {
//                 logger.info('ERROR ' + host + error, user)
//             }
//         }
//
//         if (linkToDownload === '') {
//             // Set movie in progress state to movie in error (in db)
//             const snapshot = await usersRef.child(user.uid).child('/movies').orderByChild("title").equalTo(title).once('value');
//             const inProgressMovie = snapshot.val();
//
//             if (inProgressMovie) {
//                 // If several inProgressMovies with the same title, taking the first one
//                 const firstInProgressMovieCorrespondig =  inProgressMovie[Object.keys(inProgressMovie)[0]];
//                 await usersRef.child(user.uid).child('/movies').child(firstInProgressMovieCorrespondig.id).child('/state').set('error');
//             }
//
//         } else {
//             return await download.startMovieDownload(linkToDownload, title, user);
//         }
//
//
//     } else {
//         // if premium links are found
//         // Check firstly premium links | and if no one is a good one --> check the free ones
//
//         let linkToDownload = '';
//
//         // Doing this to firstly check when there is an only one link (preferable)
//         const premiumHostsOrdered = hosts.premium.sort((a, b) => {
//             return a.links.length - b.links.length
//         });
//
//         for (let host in premiumHostsOrdered) {
//             try {
//
//                 linkToDownload = await realdebrid.getUnrestrictedLinks(await unprotectLinks(premiumHostsOrdered[host].links, provider, user), user);
//
//                 if (linkToDownload !== '' && linkToDownload !== undefined) {
//                     break;
//                 }
//
//             } catch(error) {
//                 logger.info('ERROR ' + host + error, user)
//             }
//         }
//
//         if (linkToDownload === '') {
//             // Set movie in progress (in db) to movie in error
//             // Set movie in progress state to movie in error (in db)
//             const snapshot = await usersRef.child(user.uid).child('/movies').orderByChild("title").equalTo(title).once('value');
//             const inProgressMovie = snapshot.val();
//
//             if (inProgressMovie) {
//                 // If several inProgressMovies with the same title, taking the first one
//                 const firstInProgressMovieCorrespondig =  inProgressMovie[Object.keys(inProgressMovie)[0]];
//                 await usersRef.child(user.uid).child('/movies').child(firstInProgressMovieCorrespondig.id).child('/state').set('error');
//             }
//
//         } else {
//             return await download.startMovieDownload(linkToDownload, title, user);
//         }
//
//     }
//
// };

const unprotectLinks = async (links: any, provider: any, user: any) => {
    switch (provider) {
        case 'zonetelechargementlol':
            return await dlprotect.getUnprotectedLinks(links);
            break;
        case 'zonetelechargement':
            return await dlprotect.getUnprotectedLinksWithPuppeteer(links, user);
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
// module.exports.startDownloadMovieTask = startDownloadMovieTask;
