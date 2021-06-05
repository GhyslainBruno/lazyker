import {Database} from '../database/database';
import {StorageEnum} from '../entities/storage.enum';

const realdebrid = require('../debriders/realdebrid/debrid_links');
const gdrive = require('../storage/gdrive/gdrive');
const synology = require('../storage/synology/Download');
const admin = require("firebase-admin");
const nas = require('../storage/synology/Download');
const db = admin.database();
const usersRef = db.ref("/users");
const pMap = require('p-map');
const utils = require('../utils/downloads/MultipleDownloads');
const wait = require('wait-promise');
const sleep = wait.sleep;

/**
 * Start the download of a torrent file already downloaded in realdebrid service
 * @param torrent
 * @param name
 * @param user
 * @param res
 * @returns {Promise<void>}
 */
export const startRealdebridTorrentDownload = async (torrent: any, name: any, user: any, res: any) => {
    try {

        utils.initPassage();

        await pMap(torrent.links, async (link: any) => {
            // Here, if several links  in the torrent -> torrent.links.length > 1
            const unrestrictedLink = await realdebrid.unrestricLinkNoDB(link, user);

            // const storage = await usersRef.child(user.uid).child('/settings/storage').once('value');
            const selectedStorage = await Database.getSelectedStorage(user);

            const torrentInfos = await usersRef.child(user.uid).child(`/torrentsDownloaded/${torrent.id}`).once('value');

            // Sending response here because of the process when uploading files to google drive (an await is blocking the thread)
            // TODO find a more elegant way to do that

            await sleep(1000);
            switch (selectedStorage) {

                case StorageEnum.GOOGLE_DRIVE :
                    // Removed the "await" so that if many links have to be downloaded, no need to wait for the "packet" return
                    gdrive.downloadMovieFile(unrestrictedLink, user, name, torrentInfos.val(), unrestrictedLink, res);
                    break;

                case StorageEnum.NAS :

                    // TODO add res in here otherwise NAS won't be supported anymore
                    await synology.startRealdebridTorrentDownload(unrestrictedLink, name, user);
                    break;

                default:
                    throw new Error('Unknown storage');
            }
        }, {concurrency: 1});

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
export const startMovieDownload = async (linkFromRealdebrid: any, title: any, user: any) => {
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
