import {TorrentInDebriderInfos} from '../entities/torrent-in-debrider-infos';
import {User} from '../entities/user';


export interface IDebrider {

  // We should add in db torrent's information to be able to create a directory (for the download) with a proper name
  // (not only using torrent name for that)
  // As it is done in realdebrid provider
  addMagnetLink(magnetLink: string, user: any): Promise<TorrentInDebriderInfos>;

  // connectUser(user: User, pin?: string, check?: string): Promise<string>;
}
