const admin = require("firebase-admin");
const db = admin.database();
const usersRef = db.ref("/users");

/**
 * Returns all tv Shows with "autoUpdate" property to true from Firebase database
 * @returns {Promise<any>}
 */
async function getTvShowsToUpdateFromDatabase(user) {
    // Set movie in progress state to movie in error (in db)
    const snapshot = await usersRef.child(user.uid).child('/shows').orderByChild('autoUpdate').equalTo(true).once('value');
    const autoUpdateShows = snapshot.val();
    return autoUpdateShows;
}

/**
 * Get Tv Shows path from firebase database
 * @param user
 * @returns {Promise<void>}
 */
const getTvShowsPath = async user => {
    const snapshot = await usersRef.child(user.uid).child('/settings/nas/tvShowsPath').once('value');
    return snapshot.val();
};

/**
 * Get the qualities wanted for Tv Shows - TODO: Test if the model of "qualities" object is ok
 * @param user
 * @returns {Promise<void>}
 */
const getQualitiesWanted = async user => {
    const snapshot = await usersRef.child(user.uid).child('/settings/qualities').once('value');
    return snapshot.val();
};

module.exports.getTvShowsPath = getTvShowsPath;
module.exports.getTvShowsToUpdateFromDatabase = getTvShowsToUpdateFromDatabase;
module.exports.getQualitiesWanted  = getQualitiesWanted;