const gdrive = require('../../../gdrive/gdrive');
const stringSimilarity = require('string-similarity');
const pMap = require('p-map');

/**
 * Returns tv shows to update but from gdrive
 * @param showsFromGdrive
 * @param showsFromDb
 * @param tvShowsFolder
 * @returns {Promise<Array>}
 */
const getTvShowsToUpdateFromGdrive = async (showsFromGdrive, showsFromDb, tvShowsFolder) => {

    if (showsFromDb === null) throw Error("No Tv Shows specified in Database");
    if (showsFromGdrive === null) throw Error("No Tv Shows to update in storage");
    if (tvShowsFolder === null) throw Error("No Tv Shows path specified in settings");

    try {
        const showsFromFilesToUpdate = [];
        Object.keys(showsFromDb).forEach(showFromDbId => {

            const showFromDb = showsFromDb[showFromDbId];

            const showTitleFromGdriveToUpdate = stringSimilarity.findBestMatch(showFromDb.title, showsFromGdrive.map(show => show.name)).bestMatch.target;

            const showFomFilesToUpdate = showsFromGdrive.filter(show => {return show.name === showTitleFromGdriveToUpdate})[0];

            // If the two titles are not almost identical --> it means it is a new show to add to the library --> TODO: check if 0.5 is the good number
            if (stringSimilarity.compareTwoStrings(showTitleFromGdriveToUpdate, showFromDb.title) > 0.5) {

                // Using Tv Show title from tmdb and not the one used when naming the folder
                showFomFilesToUpdate.name = showFromDb.title;
                showFomFilesToUpdate.isNew = false;

                showsFromFilesToUpdate.push(showFomFilesToUpdate)
            } else {

                // If it is a new show --> we create the show
                showsFromFilesToUpdate.push({
                    isNew: true,
                    name: showFromDb.title,
                })
            }

        });

        return showsFromFilesToUpdate
    } catch(error) {
        throw error;
    }
};
module.exports.getTvShowsToUpdateFromGdrive = getTvShowsToUpdateFromGdrive;

/**
 * Returns the last episodes of tv shows present in google drive folders
 * @param user
 * @param shows
 * @returns {Promise<void>}
 */
const getLastEpisodes = async (user, shows) => {

    try {

        await pMap(shows, async show => {

            // Checking if the show we want to get the last episode/season number is a new one, is fo --> bypass the process and set the numbers manually
            if (show.isNew !== undefined && show.isNew) {

                show.lastSeason = '01';
                show.lastEpisode = '0';

            } else {

                const seasons = await gdrive.getFilesList(user, show);

                let lastSeasonFolder = '';

                // If season is empty
                if (await gdrive.isFolderEmpty(user, seasons[seasons.length-1])) {
                    // If there is more thant 1 season folder
                    if (seasons.files.length > 1) {
                        shows.filter(file => file.name === show.name)[0].lastSeason = seasons[seasons.length-2].name.match(/\d+/)[0];
                        lastSeasonFolder = seasons[seasons.length-2];
                    } else {
                        shows.filter(file => file.name === show.name)[0].lastSeason = seasons[seasons.length-1].name.match(/\d+/)[0];
                        lastSeasonFolder = seasons[seasons.length-1];
                    }
                } else {
                    shows.filter(file => file.name === show.name)[0].lastSeason = seasons[seasons.length-1].name.match(/\d+/)[0];
                    lastSeasonFolder = seasons[seasons.length-1];
                }

                const episodes = await gdrive.getFilesList(user, lastSeasonFolder);

                if (await gdrive.isFolderEmpty(user, episodes[episodes.length-1])) {

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

        return shows;

    } catch(error) {
        throw error
    }

};
module.exports.getLastEpisodes = getLastEpisodes;
