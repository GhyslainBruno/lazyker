// const Syno = require('syno');
// const stringSimilarity = require('string-similarity');
// const pMap = require('p-map');
// const logger = require('../logs/logger');

// console.log("\n");
// logger.info("Starting auto update...");

// const showScrappers = require('../scrappers/main');
// const dsmCommunication = require('../synology/Download');


// const tvShowsPathRoot = db.getData('/configuration/nas/tvShowsPath');


// Trying to bubble error to parent process
// process.on('uncaughtException', function(e){
//     if (typeof process.send === "function") {
//         process.send(e);
//     }
// });



// /**
//  *
//  * @param path
//  * @returns {Promise<any>}
//  */
// function getFilesList(path) {
//     return new Promise(function(resolve, reject) {
//         syno.fs.list({'folder_path': path }, function(error, data) {
//             if (!error) {
//                 resolve(data)
//             } else {
//                 reject(error)
//             }
//         });
//     })
// }

// /**
//  *
//  * @returns {Promise<any>}
//  */
// async function getTvShowsToUpdateFromDatabase() {
//     const shows = db.getData('/shows');
//     return shows.filter(show => show.autoUpdate === true)
// }

// /**
//  * Returns tv shows to update but from files
//  * @param showsFromFiles
//  * @param showsFromDb
//  * @returns {Promise<Array>}
//  */
// getTvShowsToUpdateFromFiles = async (showsFromFiles, showsFromDb) => {
//
//     try {
//         const showsFromFilesToUpdate = [];
//         showsFromDb.forEach(showFromDb => {
//
//             const showTitleFromFilesToUpdate = stringSimilarity.findBestMatch(showFromDb.title, showsFromFiles.files.map(show => show.name)).bestMatch.target;
//
//             const showFomFilesToUpdate = showsFromFiles.files.filter(show => {return show.name === showTitleFromFilesToUpdate})[0];
//
//             // If the two titles are not almost identical --> it means it is a new show to add t the library --> TODO: check if 0.5 is the good number
//             if (stringSimilarity.compareTwoStrings(showTitleFromFilesToUpdate, showFromDb.title) > 0.5) {
//                 showFomFilesToUpdate.name = showFromDb.title;
//                 showsFromFilesToUpdate.push(showFomFilesToUpdate)
//             } else {
//
//                 // If it is a new show --> we create the show
//                 showsFromFilesToUpdate.push({
//                     isNew: true,
//                     isdir: true,
//                     name: showFromDb.title,
//                     path: tvShowsPathRoot + '/' + showFromDb.title
//                 })
//             }
//
//         });
//
//         return showsFromFilesToUpdate
//     } catch(error) {
//         throw error;
//     }
// };

// /**
//  * Returns the last episodes of tv shows
//  * @param shows
//  * @returns {Promise<*>}
//  */
// async function getLastEpisodes(shows) {
//
//     try {
//         await pMap(shows, async show => {
//
//             // Checking if the show we want to get the last episode/season number is a new one, is fo --> bypass the process and set the numbers manually
//             if (show.isNew !== undefined && show.isNew) {
//
//                 show.lastSeason = '01';
//                 show.lastEpisode = '0';
//
//             } else {
//                 const seasons = await getFilesList(show.path);
//
//                 let lastSeasonPath = '';
//
//                 // TODO: check emptyness an only one time --> should de until isEmpty = false
//                 // If the season foler is empty
//                 if (await isEmpty(seasons.files[seasons.files.length-1].path)) {
//                     // If there is more thant 1 season folder
//                     if (seasons.files.length > 1) {
//                         shows.filter(file => file.name === show.name)[0].lastSeason = seasons.files[seasons.files.length-2].name.match(/\d+/)[0];
//                         lastSeasonPath = seasons.files[seasons.files.length-2].path;
//                     } else {
//                         shows.filter(file => file.name === show.name)[0].lastSeason = seasons.files[seasons.files.length-1].name.match(/\d+/)[0];
//                         lastSeasonPath = seasons.files[seasons.files.length-1].path;
//                     }
//                 } else {
//                     shows.filter(file => file.name === show.name)[0].lastSeason = seasons.files[seasons.files.length-1].name.match(/\d+/)[0];
//                     lastSeasonPath = seasons.files[seasons.files.length-1].path;
//                 }
//
//                 let episodes = await getFilesList(lastSeasonPath);
//
//                 // Keeping only "episode" objects which are directories
//                 episodes = episodes.files.filter(episode => episode.isdir);
//
//                 if (await isEmpty(episodes[episodes.length-1].path)) {
//
//                     if (episodes.length > 1) {
//                         shows.filter(file => file.name === show.name)[0].lastEpisode = episodes[episodes.length-2].name.match(/[Ss]\d+[Ee]\d+/)[0].match(/[Ee]\d+$/)[0].replace("E", "").replace("e", "");
//                     } else {
//                         shows.filter(file => file.name === show.name)[0].lastEpisode = episodes[episodes.length-1].name.match(/[Ss]\d+[Ee]\d+/)[0].match(/[Ee]\d+$/)[0].replace("E", "").replace("e", "");
//                     }
//
//                 } else {
//                     shows.filter(file => file.name === show.name)[0].lastEpisode = episodes[episodes.length-1].name.match(/[Ss]\d+[Ee]\d+/)[0].match(/[Ee]\d+$/)[0].replace("E", "").replace("e", "");
//                 }
//             }
//
//         }, {concurency: 10});
//
//         return shows
//     } catch(error) {
//         return error
//     }
//
//
// }

// /**
//  * Returns true if a folder is empty
//  * @param path
//  * @returns {Promise<boolean>}
//  */
// async function isEmpty(path) {
//     const results = await getFilesList(path);
//     return results.files.length === 0;
// }

/**
 *
 * @returns {Promise<void>}
 */
async function mainFunction() {

    try {

        // console.timeEnd('initialization');

        // test new database
        // const insertShows = await addTvShowsToDatabase()

        // First -> Get all the tvShows from NAS
        const showsFromFiles = await getFilesList(tvShowsPathRoot);

        // Then -> Get all the "autoUpdate" tvShows from Firestore
        const showsToUpdate = await getTvShowsToUpdateFromDatabase();

        // Filter the fileList (from NAS) with shows from DB
        const showsToUpdateFromFiles = await getTvShowsToUpdateFromFiles(showsFromFiles, showsToUpdate);

        // Then -> for all the autoUpdate tvShows -> find last season/episode numbers
        let lastEpisodes = await getLastEpisodes(showsToUpdateFromFiles);

        // Then -> call scrapper(s) with this array of objects
        // Adds, for each tvShow, a property "unrestrictedLink"
        await pMap(lastEpisodes, async link => {

            // Adding 1 to last episode know from FileStation API
            link.lastEpisode = (parseInt(link.lastEpisode) + 1).toString().padStart(2, '0');

            let betterLink = await showScrappers.getLink(link, db);

            // Better to check if the episode wanted is found or not
            if (betterLink === null) {

                const lastEpisodeObjectToUseHere = lastEpisodes.find(show => show.name === link.name);

                lastEpisodeObjectToUseHere.lastSeason = (parseInt(link.lastSeason) + 1).toString().padStart(2, '0');
                lastEpisodeObjectToUseHere.lastEpisode = '01';

                betterLink = await showScrappers.getLink(lastEpisodeObjectToUseHere, db);

                if (betterLink === null) {
                    // logger.info('No new episode found for ' + lastEpisodeObjectToUseHere.name)
                }

                lastEpisodes.find(show => show.name === link.name).unrestrictedLink = betterLink;

            } else {

                lastEpisodes.find(show => show.name === link.name).unrestrictedLink = betterLink;

            }

        }, {concurency: 10});

        // Then -> filter for shows with null "unrestrictedLinks"
        lastEpisodes = lastEpisodes.filter(show => show.unrestrictedLink !== null);

        // Then -> start downloads for all other tv shows
        await pMap(lastEpisodes, async (show) => {
            await dsmCommunication.startDownload(show, syno, db);
        }, {concurency: 10});

        // logger.info(logger.info('test')lastEpisodes)
        // Then -> launch a download with the result of scrapper(s)


    } catch (error) {

        // TODO: handle all errors possible
        logger.info(error.message)
    }
}

/**
 *
 */
mainFunction()
    .then(function(data) {
        logger.info('Auto Update done - terminated normally');
    })
    .catch(error => {
        logger.info('Auto Update done - terminated with ERROR(S):');
        logger.info(error);
        if (typeof process.send === "function") {
            process.send(error);
        }
    });