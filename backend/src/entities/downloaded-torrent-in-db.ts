import {MediaInfos} from './media-infos';
import {TorrentInDebriderInfos} from './torrent-in-debrider-infos';

export class DownloadedTorrentInDb {
    id: number;
    mediaInfos: MediaInfos;
    torrent: TorrentInDebriderInfos;

    constructor(mediaInfos: MediaInfos, torrent: TorrentInDebriderInfos) {
        this.id = torrent.id;
        this.mediaInfos = mediaInfos;
        this.torrent = torrent;
    }
}
