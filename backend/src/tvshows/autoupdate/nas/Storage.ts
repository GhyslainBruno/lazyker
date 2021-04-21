const filesList = require('../../../synology/FilesList');
const synology = require('../../../synology/Connector');
const stringSimilarity = require('string-similarity');
const pMap = require('p-map');
const dsmCommunication = require('../../../synology/Download');

/**
 * Get FilesList from storage
 * @param path
 * @param syno
 * @returns {Promise<void>}
 */
getFilesList = async (path, syno) => {
    try {
        return await filesList.getFilesList(path, syno);
    } catch(error) {
        throw error;
    }
};

/**
 * Returns the last episodes of tv shows
 * @param shows
 * @param storageInstance
 * @returns {Promise<*>}
 */
async function getLastEpisodes(shows, storageInstance) {

    try {
        await pMap(shows, async show => {

            // Checking if the show we want to get the last episode/season number is a new one, is fo --> bypass the process and set the numbers manually
            if (show.isNew !== undefined && show.isNew) {

                show.lastSeason = '01';
                show.lastEpisode = '0';

            } else {
                const seasons = await getFilesList(show.path, storageInstance);

                let lastSeasonPath = '';

                // TODO: check emptyness an only one time --> should de until isEmpty = false
                // If the season foler is empty
                if (await isEmpty(seasons.files[seasons.files.length-1].path, storageInstance)) {
                    // If there is more thant 1 season folder
                    if (seasons.files.length > 1) {
                        shows.filter(file => file.name === show.name)[0].lastSeason = seasons.files[seasons.files.length-2].name.match(/\d+/)[0];
                        lastSeasonPath = seasons.files[seasons.files.length-2].path;
                    } else {
                        shows.filter(file => file.name === show.name)[0].lastSeason = seasons.files[seasons.files.length-1].name.match(/\d+/)[0];
                        lastSeasonPath = seasons.files[seasons.files.length-1].path;
                    }
                } else {
                    shows.filter(file => file.name === show.name)[0].lastSeason = seasons.files[seasons.files.length-1].name.match(/\d+/)[0];
                    lastSeasonPath = seasons.files[seasons.files.length-1].path;
                }

                let episodes = await getFilesList(lastSeasonPath, storageInstance);

                // Keeping only "episode" objects which are directories
                episodes = episodes.files.filter(episode => episode.isdir);

                // TODO: test bug when episodes = []
                if (await isEmpty(episodes[episodes.length-1].path, storageInstance)) {

                    if (episodes.length > 1) {
                        shows.filter(file => file.name === show.name)[0].lastEpisode = episodes[episodes.length-2].name.match(/[Ss]\d+[Ee]\d+/)[0].match(/[Ee]\d+$/)[0].replace("E", "").replace("e", "");
                    } else {
                        shows.filter(file => file.name === show.name)[0].lastEpisode = episodes[episodes.length-1].name.match(/[Ss]\d+[Ee]\d+/)[0].match(/[Ee]\d+$/)[0].replace("E", "").replace("e", "");
                    }

                } else {
                    shows.filter(file => file.name === show.name)[0].lastEpisode = episodes[episodes.length-1].name.match(/[Ss]\d+[Ee]\d+/)[0].match(/[Ee]\d+$/)[0].replace("E", "").replace("e", "");
                }
            }

        }, {concurency: 10});

        return shows
    } catch(error) {
        return error
    }
}

/**
 * Returns tv shows to update but from files
 * @param showsFromFiles
 * @param showsFromDb
 * @param tvShowsPath
 * @returns {Promise<Array>}
 */
const getTvShowsToUpdateFromFiles = async (showsFromFiles, showsFromDb, tvShowsPath) => {

    if (showsFromDb === null) throw Error("No Tv Shows specified in Database");
    if (showsFromFiles === null) throw Error("No Tv Shows to update in storage");
    if (tvShowsPath === null) throw Error("No Tv Shows path specified in settings");

    try {
        const showsFromFilesToUpdate = [];
        Object.keys(showsFromDb).forEach(showFromDbId => {

            const showFromDb = showsFromDb[showFromDbId];

            const showTitleFromFilesToUpdate = stringSimilarity.findBestMatch(showFromDb.title, showsFromFiles.files.map(show => show.name)).bestMatch.target;

            const showFomFilesToUpdate = showsFromFiles.files.filter(show => {return show.name === showTitleFromFilesToUpdate})[0];

            // If the two titles are not almost identical --> it means it is a new show to add t the library --> TODO: check if 0.5 is the good number
            if (stringSimilarity.compareTwoStrings(showTitleFromFilesToUpdate, showFromDb.title) > 0.5) {
                showFomFilesToUpdate.name = showFromDb.title;
                showsFromFilesToUpdate.push(showFomFilesToUpdate)
            } else {

                // If it is a new show --> we create the show
                showsFromFilesToUpdate.push({
                    isNew: true,
                    isdir: true,
                    name: showFromDb.title,
                    path: tvShowsPath + '/' + showFromDb.title
                })
            }

        });

        return showsFromFilesToUpdate
    } catch(error) {
        throw error;
    }
};

/**
 * Returns true if a folder is empty
 * @param path
 * @param storageInsance
 * @returns {Promise<boolean>}
 */
const isEmpty = async (path, storageInsance) => {
    const results = await getFilesList(path, storageInsance);
    return results.files.length === 0;
};

/**
 * Get a connection to storage device
 * @param user
 * @returns {Promise<void>}
 */
const getConnection = async user => {
    try {
        return await synology.getConnection(user);
    } catch(error) {
        throw error;
    }
};

/**
 * Start a download on the storage instance
 * @param lastEpisodes
 * @param storageInstance
 * @param user
 * @returns {Promise<void>}
 */
const startDownload = async (lastEpisodes, storageInstance, user) => {

    await pMap(lastEpisodes, async (show) => {
        await dsmCommunication.startDownload(show, storageInstance, user);
    }, {concurency: 10});

};


module.exports.getFilesList = getFilesList;
module.exports.getConnection = getConnection;
module.exports.getTvShowsToUpdateFromFiles = getTvShowsToUpdateFromFiles;
module.exports.getLastEpisodes = getLastEpisodes;
module.exports.startDownload = startDownload;