import {Torrent as TorrentSearchApiTorrent, enableProvider, search, downloadTorrent} from 'torrent-search-api';
import {AllDebrid} from '../../debriders/alldebrid/alldebrid-debrider';
import {Debrider} from '../../debriders/debrider';
import {MediaInfos} from '../../entities/media-infos';
import {ScrapperTorrentInfos} from '../../entities/scrapper-torrent-infos';
import {User} from '../../entities/user';
import {Storage} from '../../storage/storage';
import {Uptobox} from '../../storage/uptobox/uptobox';
import {Torrent} from './torrent';
import {TorrentProviderEnum} from './torrent-provider-enum';
import {TorrentsList} from './torrents-list';
import {Torrent as TorrentSearchApi} from 'torrent-search-api';
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
 * @param user
 * @param scrapperTorrentInfos
 * @param mediaInfos
 */
export const downloadTorrentFile = async (user: User, scrapperTorrentInfos: ScrapperTorrentInfos, mediaInfos: MediaInfos) => {

    enableProvider('Yggtorrent', 'Ghyslain', 'foobar');

    // Weird stuff
    scrapperTorrentInfos.provider = 'Yggtorrent';

    await downloadTorrent(scrapperTorrentInfos, path.join(__dirname, '/torrent_temp/file.torrent'))

    const torrent = parseTorrent(fs.readFileSync(path.join(__dirname, '/torrent_temp/file.torrent')));

    // Create magnet link using torrent file infos
    const magnetLink = parseTorrent.toMagnetURI(
      torrent
    );

    // Removing torrent file
    await removeAllFiles(path.join(__dirname, 'torrent_temp'));

    // TODO: think about it to improve !
    const debrider = new Debrider(AllDebrid, Uptobox, user);
    const storage = new Storage(AllDebrid, Uptobox, user);

    const torrentInfos = await debrider.addMagnet(magnetLink, mediaInfos, user);
    await storage.addTorrent(mediaInfos, torrentInfos, user);
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
