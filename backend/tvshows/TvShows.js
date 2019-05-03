const ygg = require('../scappers/ygg/ygg');
const torrent9 = require('../scappers/torrents9/torrent9');
const admin = require("firebase-admin");
const db = admin.database();
const usersRef = db.ref("/users");

/**
 * Downloads episode torrent file to deriber's service
 * @param url
 * @param provider
 * @param mediaInfos
 * @param id
 * @param user
 * @returns {Promise<void>}
 */
const downloadEpisodeTorrentFile = async (url, provider, mediaInfos, id, user) => {

    try {
        switch (provider) {
            case 'ygg':
                await ygg.downloadTorrentFile(url, user, mediaInfos);
                break;
            case 'torrent9':
                await torrent9.downloadTorrentFile(url, user, mediaInfos);
                break;
            default:
                throw new Error('bad provider');
        }

        const snapshot = await usersRef.child(user.uid).child('/movies').orderByChild("title").equalTo(id).once('value');
        const inProgressMovie = snapshot.val();

        if (inProgressMovie) {
            // If several inProgressMovies with the same title, taking the first one
            const firstInProgressMovieCorrespondig =  inProgressMovie[Object.keys(inProgressMovie)[0]];
            await usersRef.child(user.uid).child('/movies').child(firstInProgressMovieCorrespondig.id.replace(/\./g, '').replace(/#/g, '').replace(/\$/g, '').replace(/\[/g, '').replace(/]/g, '')).remove();
        }

    } catch(error) {

        // Set movie in progress state to movie in error (in db)
        const snapshot = await usersRef.child(user.uid).child('/movies').orderByChild("title").equalTo(id).once('value');
        const inProgressMovie = snapshot.val();

        if (inProgressMovie) {
            // If several inProgressMovies with the same title, taking the first one
            const firstInProgressMovieCorrespondig =  inProgressMovie[Object.keys(inProgressMovie)[0]];
            await usersRef.child(user.uid).child('/movies').child(firstInProgressMovieCorrespondig.id.replace(/\./g, '').replace(/#/g, '').replace(/\$/g, '').replace(/\[/g, '').replace(/]/g, '')).child('/state').set('error');
        }

    }

};
module.exports.downloadEpisodeTorrentFile = downloadEpisodeTorrentFile;