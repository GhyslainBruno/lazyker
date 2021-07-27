import {MediaInfos} from '../entities/media-infos';
import { TorrentInDebriderInfos } from '../entities/torrent-in-debrider-infos';

export interface IStorage {
  addTorrent(mediaInfos: MediaInfos, torrentInfos: TorrentInDebriderInfos, user: any): Promise<any>;
}
