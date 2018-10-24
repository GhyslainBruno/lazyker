const storage = require('./Storage');
const database = require('./Database');
const scrapers = require('./Scrapers');
const logger = require('../logs/logger');

/**
 * Update steps :
 * 1 - Get Tv Shows path from Firebase database
 * 2 - Get storage instance - only Synology for now
 * 3 - Get all the tv shows from storage (nas, for now, but unlimited drives should come "soon") - First getting tv shows path
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
const startUpdate = async user => {

    try {

        // await logger.info('Starting shows auto-update', user);

        /**
         * 1 - Get Tv Shows path from Firebase database
         */
        const tvShowsPath = await database.getTvShowsPath(user);

        /**
         * 2 - Get storage instance - only Synology for now
         */
        const storageInstance = await storage.getConnection(user);

        /**
         * 3 - Get all the tv shows from storage (nas, for now, but unlimited drives should come "soon") - First getting tv shows path
         */
        const showsFromFiles = await storage.getFilesList(tvShowsPath, storageInstance);

        /**
         * 4 - Get all the "autoUpdate" tv shows from Firebase database
         */
        const showsToUpdate = await database.getTvShowsToUpdateFromDatabase(user);

        /**
         *  5 - Filter the files list (fro storage) with shows from DB
         */
        const showsToUpdateFromFiles = await storage.getTvShowsToUpdateFromFiles(showsFromFiles, showsToUpdate, tvShowsPath);

        /**
         * 6 - For Each Tv Show: find last season/episode numbers
         */
        let lastEpisodes = await storage.getLastEpisodes(showsToUpdateFromFiles, storageInstance);

        /**
         * 7 - get the qualities wanted by the user for Tv Shows
         */
        const qualitiesWanted = await database.getQualitiesWanted(user);

        /**
         * 8 - For Each Tv Show: call scraper(s) with the last season/episode numbers | Add, for each tvShow, a property "unrestrictedLink"
         */
        lastEpisodes = await scrapers.findNewEpisodes(lastEpisodes, user, qualitiesWanted);

        /**
         * 9 - Filter Tv Shows with null "unrestrictedLinks"
         */
        lastEpisodes = lastEpisodes.filter(show => show.unrestrictedLink !== null);

        /**
         * 10 - Start downloads for all other Tv Shows
         */
        await storage.startDownload(lastEpisodes, storageInstance, user);

        // await logger.info('Shows auto-update done', user);

    } catch (error) {
        await logger.info(error.message, user);
        throw error;
    }
};

module.exports.startUpdate = startUpdate;