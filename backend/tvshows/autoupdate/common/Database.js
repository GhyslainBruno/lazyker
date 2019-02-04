const admin = require("firebase-admin");
const db = admin.database();
const usersRef = db.ref("/users");
const stringSimilarity = require('string-similarity');

/**
 * Returns all tv Shows with "autoUpdate" property to true from Firebase database
 * @returns {Promise<any>}
 */
async function getTvShowsToUpdateFromDatabase(user) {
    // Set movie in progress state to movie in error (in db)
    const snapshot = await usersRef.child(user.uid).child('/shows').orderByChild('autoUpdate').equalTo(true).once('value');
    return snapshot.val();
}
module.exports.getTvShowsToUpdateFromDatabase = getTvShowsToUpdateFromDatabase;

/**
 * Get Tv Shows path from firebase database
 * @param user
 * @returns {Promise<void>}
 */
const getTvShowsPath = async user => {
    const snapshot = await usersRef.child(user.uid).child('/settings/nas/tvShowsPath').once('value');
    return snapshot.val();
};
module.exports.getTvShowsPath = getTvShowsPath;

/**
 * Get Tv Shows path from firebase database - only for Google drive users
 * @param user
 * @returns {Promise<void>}
 */
const getTvShowsFolderGdrive = async user => {
    const snapshot = await usersRef.child(user.uid).child('/settings/gdrive/tvShowsGdriveFolder').once('value');
    return snapshot.val();
};
module.exports.getTvShowsFolderGdrive = getTvShowsFolderGdrive;

/**
 * Get the qualities wanted for Tv Shows - TODO: Test if the model of "qualities" object is ok
 * @param user
 * @returns {Promise<void>}
 */
const getQualitiesWanted = async user => {
    const snapshot = await usersRef.child(user.uid).child('/settings/qualities').once('value');
    const qualities = snapshot.val();

    // Removing all qualities set to "none
    return await Object.keys(qualities).filter(key => qualities[key] !== "none").reduce((obj, key) => {obj[key] = qualities[key]; return obj;}, {});
};
module.exports.getQualitiesWanted  = getQualitiesWanted;

/**
 * Return the lang ("fr" or "vostfr") for a particular tv show, present in database
 * @param show
 * @param user
 * @returns {Promise<*>}
 */
const getLangWantedForThisTvShow = async (show, user) => {

    const showsSnapshot = await usersRef.child(user.uid).child('/shows').once('value');
    const shows = showsSnapshot.val();

    const showTitleWantedToUpdateFromDb = stringSimilarity.findBestMatch(show.name, Object.keys(shows).map(showId => shows[showId].title)).bestMatch.target;

    const showsOrdered = await usersRef.child(user.uid).child('/shows').orderByChild("title").equalTo(showTitleWantedToUpdateFromDb).once('value');
    const showsWanted = showsOrdered.val();
    return showsWanted[Object.keys(showsWanted)[0]].lang;

};
module.exports.getLangWantedForThisTvShow = getLangWantedForThisTvShow;