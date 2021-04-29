import {MovieInfos, TorrentId} from '../debriders/debrider';

export interface IStorage {
  addTorrent(torrentId: TorrentId, movieInfos: MovieInfos, user: any): Promise<any>;
}
