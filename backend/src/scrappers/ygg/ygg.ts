import {Torrent as TorrentSearchApiTorrent, enableProvider, search, downloadTorrent} from 'torrent-search-api';
import {AllDebrid} from '../../debriders/alldebrid/alldebrid-provider';
import {Torrent} from './torrent';
import {TorrentProviderEnum} from './torrent-provider-enum';
import {TorrentsList} from './torrents-list';
import fs from 'fs';
import path from 'path';
import parseTorrent from 'parse-torrent';

const getTorrentsApi = async (title: string): Promise<Torrent[]> => {
    const searchTorrentApiTorrents = await search(title, 'Movies', 20);

    return searchTorrentApiTorrents.map((searchTorrentApiTorrent: TorrentSearchApiTorrent) => {
        return new Torrent(
          TorrentProviderEnum.YGG,
          searchTorrentApiTorrent.title,
          // TODO: change definition file for this lib
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

// TODO: extract user part
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

        // TODO : change this behaviour
        infos.provider = 'Yggtorrent';
        infos.link = infos.url;

        enableProvider('Yggtorrent', 'Ghyslain', 'foobar');

        await downloadTorrent(infos, path.join(__dirname, '/torrent_temp/file.torrent'))

        const torrentInfos = parseTorrent(fs.readFileSync(path.join(__dirname, '/torrent_temp/file.torrent')));

        // Create magnet link using torrent file infos
        const magnetLink = parseTorrent.toMagnetURI(
            torrentInfos
        );

        // Removing torrent file
        await removeAllFiles(path.join(__dirname, 'torrent_temp'));

        const allDebrid = new AllDebrid();

        await allDebrid.addMagnetLink(magnetLink, user);

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
