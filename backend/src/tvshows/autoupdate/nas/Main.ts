// const storage = require('./Storage');
// const database = require('../common/Database');
// const scrapers = require('../common/Scrapers');
// const logger = require('../../../logs/logger');
//
// /**
//  * Update steps :
//  * 1 - Get Tv Shows path from Firebase database
//  * 2 - Get storage instance - only Synology for now
//  * 3 - Get all the tv shows from storage (nas, for now, but unlimited drives should come "soon") - First getting tv shows path
//  * 4 - Get all the "autoUpdate" tv shows from Firebase database
//  * 5 - Filter the files list (fro storage) with shows from DB
//  * 6 - For Each Tv Show: find last season/episode numbers
//  * 7 - get the qualities wanted by the user for Tv Shows
//  * 8 - For Each Tv Show: call scraper(s) with the last season/episode numbers | Add, for each tvShow, a property "unrestrictedLink"
//  * 9 - Filter Tv Shows with null "unrestrictedLinks"
//  * 10 - Start downloads for all other Tv Shows
//  */
//
// /**
//  * Passes through all the big steps above
//  * @returns {Promise<void>}
//  */
// const startUpdate = async user => {
//
//     try {
//
//         // await logger.info('Starting shows auto-update', user);
//
//         /**
//          * 1 - Get Tv Shows path from Firebase database
//          * Returns : string
//          */
//         const tvShowsPath = await database.getTvShowsPath(user);
//
//         /**
//          * 2 - Get storage instance - only Synology for now
//          * Returs : Storage instance (TODO check structure of object)
//          */
//         const storageInstance = await storage.getConnection(user);
//
//         /**
//          * 3 - Get all the tv shows from storage (nas, for now, but unlimited drives should come "soon") - First getting tv shows path
//          * Returns :
//          * {
//          *     total: int,
//          *     offset: int, (not mandatory)
//          *     files: [
//          *         {
//          *             isdir: bool, TODO check if mandatory
//          *             name: string,
//          *             path: string
//          *         }
//          *     ]
//          * }
//          */
//         const showsFromFiles = await storage.getFilesList(tvShowsPath, storageInstance);
//
//         /**
//          * 4 - Get all the "autoUpdate" tv shows from Firebase database
//          * Returns : (coming from firebase, so using objects and not arrays)
//          * {
//          *      (tmdb ID)
//          *      id: {
//          *         autoUpdate: bool,
//          *         episode: bool,
//          *         id: int,
//          *         lang: string,
//          *         posterPath: string,
//          *         title: string
//          *     }
//          * }
//          */
//         const showsToUpdate = await database.getTvShowsToUpdateFromDatabase(user);
//
//         /**
//          *  5 - Filter the files list (fro storage) with shows from DB
//          *  Returns :
//          *     [
//          *         {
//          *             isdir: bool, TODO check if mandatory
//          *             name: string,
//          *             path: string
//          *         }
//          *     ]
//          */
//         const showsToUpdateFromFiles = await storage.getTvShowsToUpdateFromFiles(showsFromFiles, showsToUpdate, tvShowsPath);
//
//         /**
//          * 6 - For Each Tv Show: find last season/episode numbers
//          * Returns :
//          * Array [{
//          *     isdir: bool (from nas, TODO check if mandatory)
//          *     lastSeason : int
//          *     lastEpisode : int
//          *     name: string
//          *     path: string
//          * }]
//          */
//         let lastEpisodes = await storage.getLastEpisodes(showsToUpdateFromFiles, storageInstance);
//
//         /**
//          * 7 - get the qualities wanted by the user for Tv Shows
//          * Returns :
//          * {
//          *     first: string,
//          *     second: string,
//          *     third: string,
//          *     h265: bool
//          * }
//          */
//         const qualitiesWanted = await database.getQualitiesWanted(user);
//
//         /**
//          * 8 - For Each Tv Show: call scraper(s) with the last season/episode numbers | Add, for each tvShow, a property "unrestrictedLink"
//          * Returns :
//          * [
//          *      {
//          *          isdir: bool,
//          *          lastEpisode: string, (2 numbers, ex: 08)
//          *          lastSeason: string, (same as lastEpisode)
//          *          name: string,
//          *          path: string,
//          *          (realdebrid unrestrict link)
//          *          unrestrictLink: {
//          *              chunks: int,
//          *              crc: int,
//          *              download: string, (real downloadable link)
//          *              filename: string,
//          *              filesize: int, (bytes)
//          *              host: string,
//          *              host_icon: string,
//          *              id: string,
//          *              link: string, (host link)
//          *              mimType: string,
//          *              streamable: int (0 or 1 --> same as bool)
//          *          }
//          *      }
//          * ]
//          */
//         lastEpisodes = await scrapers.findNewEpisodes(lastEpisodes, user, qualitiesWanted);
//
//         /**
//          * 9 - Filter Tv Shows with null "unrestrictedLinks"
//          */
//         lastEpisodes = lastEpisodes.filter(show => show.unrestrictedLink !== null);
//
//         /**
//          * 10 - Start downloads for all other Tv Shows
//          */
//         await storage.startDownload(lastEpisodes, storageInstance, user);
//
//         // await logger.info('Shows auto-update done', user);
//
//     } catch (error) {
//         await logger.info(error.message, user);
//         throw error;
//     }
// };
//
// module.exports.startUpdate = startUpdate;
