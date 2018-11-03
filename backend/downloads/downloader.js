const realdebrid = require('../realdebrid/debrid_links');
const gdrive = require('../gdrive/gdrive');
const synology = require('../synology/Download');
const admin = require("firebase-admin");
const nas = require('../synology/Download');
const db = admin.database();
const usersRef = db.ref("/users");

/**
 * Start the download of a torrent file already downloaded in realdebrid service
 * @param torrent
 * @param name
 * @param user
 * @returns {Promise<void>}
 */
const startRealdebridTorrentDownload = async (torrent, name, user) => {
    try {
        const unrestrictedLink = await realdebrid.unrestricLinkNoDB(torrent.links[0], user);
        const storage = await usersRef.child(user.uid).child('/settings/storage').once('value');
        switch (storage.val()) {

            case 'gdrive':
                await gdrive.downloadMovieFile(unrestrictedLink, user, name);
                break;

            case 'nas' :
                await synology.startRealdebridTorrentDownload(unrestrictedLink, name, user);
                break;
        }

    } catch(error) {
        throw error
    }
};

/**
 * Starts a movie download
 * @param linkFromRealdebrid
 * @param title
 * @param user
 * @returns {Promise<void>}
 */
const startMovieDownload = async (linkFromRealdebrid, title, user) => {
    const storage = await usersRef.child(user.uid).child('/settings/storage').once('value');

    switch (storage.val()) {

        case 'gdrive':
            await gdrive.downloadMovieFile(linkFromRealdebrid[0], user, title);
            break;
        case 'nas' :
            await nas.startMovieDownload(linkFromRealdebrid, title, user);
            break;
    }
};

module.exports.startRealdebridTorrentDownload = startRealdebridTorrentDownload;
module.exports.startMovieDownload = startMovieDownload;