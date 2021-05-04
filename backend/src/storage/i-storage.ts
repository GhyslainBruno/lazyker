import {MediaInfos, TorrentInfos} from '../debriders/debrider';

export interface IStorage {
  addTorrent(mediaInfos: MediaInfos, torrentInfos: TorrentInfos, user: any): Promise<any>;
}
