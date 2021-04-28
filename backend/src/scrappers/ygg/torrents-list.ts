import {Torrent} from './torrent';
import {TorrentProviderEnum} from './torrent-provider-enum';

export class TorrentsList {

  provider: TorrentProviderEnum;
  torrents: Torrent[];

  constructor(provider: TorrentProviderEnum, torrents: Torrent[]) {
    this.provider = provider;
    this.torrents = torrents;
  }

}
