// console.time('initialization');
const Syno = require('syno');
const stringSimilarity = require('string-similarity');
const pMap = require('p-map');
const logger = require('./logs/logger');

console.log("\n");
logger.info("Starting auto update...");

const showScrappers = require('./scrappers/main');
const dsmCommunication = require('./synology/download');

// Using local NoSQL database instead of Firestore (usefull for random people) - creating a "database.json" file to store data
// var Datastore = require('nedb')
//   , dbShows = new Datastore({ filename: 'database_shows.json', autoload: true }),
//     dbConfig = new Datastore({ filename: 'database_shows.json', autoload: true }) 

// Trying to use node-json-db package as a local database
const jsonDB = require('node-json-db');

const db = new jsonDB("database.json", true, true);
db.reload();

const tvShowsPathRoot = db.getData('/configuration/nas/tvShowsPath');


// Trying to bubble error to parent process
process.on('uncaughtException', function(e){
    if (typeof process.send === "function") {
        process.send(e);
    }
});

// TODO: Configure NAS DNS serveur to not have to switch all the time + use configuration for all that sh*t
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

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://lazyker-568c4.firebaseio.com"
// });

// Server part
// const app = express();

// app.use(express.static('ui'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//     extended: true
// }));

// const server = app.listen(8080);

// const db = admin.firestore();

/**
 *
 */
async function addTvShowsToDatabase() {

    // Just a piece of code to add some new tv shows, to use before front end development done
    const showsToUpdate = [];
    showsToUpdate.push({
        title: 'The Walking Dead',
        posterPath: '/vxuoMW6YBt6UsxvMfRNwRl9LtWS.jpg',
        autoUpdate: true
    }, {
        title: 'Breaking Bad',
        posterPath: '/1yeVJox3rjo2jBKrrihIMj7uoS9.jpg',
        autoUpdate: false
    });

    // Using firestore
    // showsToUpdate.forEach(show => {
    //     db.collection('shows').doc(show.title).set(show);
    // });

    // Using Nedb
    // const shows = {
    //     shows: showsToUpdate
    // }

    // db.insert(shows)
    // db.insert({
    //     configuration: 
    //     {
    //         realdebrid: {
    //             token: 'test'
    //         ,
    //         refresh_token: 'test refresh token'
    //         },
    //         qualities: {
    //             first: 'test first quality',
    //             h265: true
    //         }
    //     }
    // })

    // db.find('configuration', function(err, doc) {
    //     logger.info(doc)
    // })

    // Using node-json-db
    db.push('/shows', showsToUpdate)

    return null
}

/**
 *
 * @param qualities
 */
function setQualityConfiguration(qualities) {
    db.collection('configuration').doc('qualities').set(qualities)
}

/**
 *
 * @param path
 * @returns {Promise<any>}
 */
function getFilesList(path) {
    return new Promise(function(resolve, reject) {
        syno.fs.list({'folder_path': path }, function(error, data) {
            if (!error) {
                resolve(data)
            } else {
                reject(error)
            }
        });
    })
}

/**
 *
 * @returns {Promise<any>}
 */
async function getTvShowsToUpdateFromDatabase() {
    // Firestore way
    // return new Promise(function(resolve, reject) {
    //     db.collection('shows').where('autoUpdate', '==', true).get()
    //         .then( snapshot => {
    //             resolve(snapshot.docs)
    //         })
    //         .catch( err => {
    //             logger.info(err)
    //         })
    // })

    // node-json-db way
    const shows = db.getData('/shows');

    return shows.filter(show => show.autoUpdate === true)
}

/**
 *
 * @param showsFromFiles
 * @param showsFromDb
 * @returns {Promise<any>}
 */
function getTvShowsToUpdateFromFiles(showsFromFiles, showsFromDb) {

    return new Promise((resolve, reject) => {
        const showsFromFilesToUpdate = [];

        showsFromDb.forEach(showFromDb => {

            // Firestore way
            // const showTitleFromFilesToUpdate = stringSimilarity.findBestMatch(showFromDb.data().title, showsFromFiles.files.map(show => show.name)).bestMatch.target
            // node-json-db way
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
                    path: tvShowsPathRoot + '/' + showFromDb.title
                })
            }

        });

        resolve(showsFromFilesToUpdate)
    })

}

/**
 *
 * @param shows
 * @returns {Promise<*>}
 */
async function getLastEpisodes(shows) {

    try {
        await pMap(shows, async show => {

            // Checking if the show we want to get the last episode/season number is a new one, is fo --> bypass the process and set the numbers manually
            if (show.isNew !== undefined && show.isNew) {

                show.lastSeason = '01';
                show.lastEpisode = '0';

            } else {
                const seasons = await getFilesList(show.path);

                let lastSeasonPath = '';

                // TODO: check emptyness an only one time --> should de until isEmpty = false
                // If the season foler is empty
                if (await isEmpty(seasons.files[seasons.files.length-1].path)) {
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

                let episodes = await getFilesList(lastSeasonPath);

                // Keeping only "episode" objects which are directories
                episodes = episodes.files.filter(episode => episode.isdir);

                if (await isEmpty(episodes[episodes.length-1].path)) {

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
 *
 * @param path
 * @returns {Promise<boolean>}
 */
async function isEmpty(path) {
    const results = await getFilesList(path);
    return results.files.length === 0;
}

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
                    logger.info('No new episode found for ' + lastEpisodeObjectToUseHere.name)
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