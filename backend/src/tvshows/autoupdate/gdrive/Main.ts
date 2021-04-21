const storage = require('./Storage');
const gdrive = require('../../../gdrive/gdrive');
const database = require('../common/Database');
const scrapers = require('./Scrappers');
const logger = require('../../../logs/logger');

/**
 * Update steps :
 * 1 - Get Tv Shows directory
 * 2 - Get all the tv shows from storage (nas, for now, but unlimited drives should come "soon") - First getting tv shows path
 * 4 - Get all the "autoUpdate" tv shows from Firebase database
 * 5 - Filter the files list (fro storage) with shows from DB
 * 6 - For Each Tv Show: find last season/episode numbers
 * 7 - get the qualities wanted by the user for Tv Shows
 * 8 - For Each Tv Show: call scraper(s) with the last season/episode numbers | Add, for each tvShow, a property "unrestrictedLink"
 * 9 - Filter Tv Shows with null "unrestrictedLinks"
 * 10 - Start downloads for all other Tv Shows
 */

/**
 * Passes through all the big steps above
 * @returns {Promise<void>}
 */
export const startUpdate = async (user: any) => {

    try {

        /**
         * Before everything : get the tv shows torrents from realdebrid to check some previous downloads
         * @type {admin.database.DataSnapshot}
         */
        const torrentsDownloadedFromDatabase = await database.getTorrentsDownloadedFromDatabase(user);

        /**
         * 1 - Get Tv Shows path from Firebase database
         * Returns ex :
        {
            "parentTvShowsGdriveFolderId": string
            "tvShowsGdriveFolderId": string
            "tvShowsGdriveFolderName": string
        }
         */
        const tvShowsFolder = await database.getTvShowsFolderGdrive(user);

        /**
         * 2 - Get all the tv shows from storage (only working for gdrive users, in this file at least) - First getting tv shows path
         * Returns :
         * [
         *         {
         *             id: string
         *             kind: string,
         *             name: string
         *             mimType: string
         *         }
         * ]
         */
        const showsFromGdrive = await gdrive.getFilesList(user, tvShowsFolder);

        /**
         * 3 - Get all the "autoUpdate" tv shows from Firebase database
         * Returns : (coming from firebase, so using objects and not arrays)
         * {
         *      (tmdb ID)
         *      id: {
         *         autoUpdate: bool,
         *         episode: bool,
         *         id: int,
         *         lang: string,
         *         posterPath: string,
         *         title: string
         *     }
         * }
         */
        const showsToUpdate = await database.getTvShowsToUpdateFromDatabase(user);

        /**
         *  4 - Filter the files list (from gdrive) with shows from DB
         *  Returns :
            [
                {
                    "kind": string,
                    "id": "string,
                    "name": "string,
                    "mimeType": string,
                    "isNew": bool
                }
            ]
         */
        const showsToUpdateFromFiles = await storage.getTvShowsToUpdateFromGdrive(showsFromGdrive, showsToUpdate, tvShowsFolder);

        /**
         * 6 - For Each Tv Show: find last season/episode numbers
         * Returns :
            [
                {
                    "kind": string,
                    "id": string,
                    "name": "string,
                    "mimeType": string,
                    "isNew": bool,
                    "lastSeason": string,
                    "lastEpisode": string
                }
            ]
         */
        let lastEpisodes = await storage.getLastEpisodes(user, showsToUpdateFromFiles, torrentsDownloadedFromDatabase);

        /**
         * 7 - get the qualities wanted by the user for Tv Shows
         * Returns :
         * {
         *     first: string,
         *     second: string,
         *     third: string,
         *     h265: bool
         * }
         */
        const qualitiesWanted = await database.getQualitiesWanted(user);

        /**
         * 8 - For Each Tv Show: download the better torrent to debrider's service
         * Returns : null
         */
        await scrapers.downloadTorrentsToDebrider(lastEpisodes, user, qualitiesWanted);

        /**
         * 9 - use an interval to check for each torrents in firebase database (isShow = true)
         * if the torrent is downloaded and then download it to the good google drive location
         * TODO
         */

        await logger.info('Autoupdate done', user);

    } catch (error) {
        await logger.info(error.message, user);
        throw error;
    }
};

module.exports.startUpdate = startUpdate;
