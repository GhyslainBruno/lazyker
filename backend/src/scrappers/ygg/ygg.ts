import {Torrent as TorrentSearchApiTorrent, enableProvider, search, downloadTorrent} from 'torrent-search-api';
import {Torrent} from './torrent';
import {TorrentProviderEnum} from './torrent-provider-enum';
import {TorrentsList} from './torrents-list';

const cheerio = require('cheerio');
const rp  = require('request-promise');
const request  = require('request');
const YGGRootUrl ='https://www2.yggtorrent.ch/';
const logger = require('../../logs/logger');
const fs = require('fs');
const path = require('path');
const torrentToMagnet = require('torrent-to-magnet');
const parseTorrent = require('parse-torrent');
const realdebrid = require('../../debriders/realdebrid/debrid_links');
const admin = require('firebase-admin');
const db = admin.database();
const usersRef = db.ref("/users");

const getTorrentsApi = async (title: string): Promise<Torrent[]> => {
    const searchTorrentApiTorrents = await search(title, 'Movies', 20);

    return searchTorrentApiTorrents.map((searchTorrentApiTorrent: TorrentSearchApiTorrent) => {
        return new Torrent(
          TorrentProviderEnum.YGG,
          searchTorrentApiTorrent.title,
          //@ts-ignore
          searchTorrentApiTorrent.link,
          +searchTorrentApiTorrent.size,
          0,
          0,
          searchTorrentApiTorrent.time,
          searchTorrentApiTorrent.magnet,
          searchTorrentApiTorrent.desc
        );
    })
}

/**
 * Returns a list of Ygg torrents for a particular title
 * @param title
 * @returns {Promise<Array>}
 */
export const getTorrentsList = async (title: string) => {

    // cloudflare-scrapper way
    enableProvider('Yggtorrent', 'Ghyslain', 'foobar');

    const torrents = await getTorrentsApi(title);

    return new TorrentsList(TorrentProviderEnum.YGG, torrents);
};

/**
 * Start the download of a torrent file -> to magnetLink -> deletes torrent file -> add to realdebrid service
 * @param torrent
 * @returns {Promise<void>}
 */
export const downloadTorrentFile = async (url: any, user: any, infos: any) => {

    try {

        infos.provider = 'Yggtorrent';
        infos.link = infos.url;

        console.log(infos);

        enableProvider('Yggtorrent', 'Ghyslain', 'foobar');

        await downloadTorrent(infos, path.join(__dirname, '/torrent_temp/file.torrent'))

        const torrentInfos = parseTorrent(fs.readFileSync(path.join(__dirname, '/torrent_temp/file.torrent')));

        // Create magnet link using torrent file infos
        const magnetLink = parseTorrent.toMagnetURI(
            torrentInfos
        );

        // Removing torrent file
        await removeAllFiles(path.join(__dirname, 'torrent_temp'));

        console.log(magnetLink);
    } catch(error) {
        console.log(error.message)
    }
}

/**
 * Removes all files of a particular directory (to use in torrent_temp directory)
 * @param directory
 * @returns {Promise<any>}
 */
const removeAllFiles = (directory: any) => {
    return new Promise<void>((resolve, reject) => {
        fs.readdir(directory, (err: any, files: any) => {
            if (err) reject(err);

            for (const file of files) {
                fs.unlink(path.join(directory, file), (err: any) => {
                    if (err) reject(err);
                });
            }
            resolve();
        });
    })
};

module.exports.getTorrentsList = getTorrentsList;
module.exports.downloadTorrentFile = downloadTorrentFile;
