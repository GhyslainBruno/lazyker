import {MediaInfos} from './media-infos';
import {ScrapperTorrentInfos} from './scrapper-torrent-infos';
import {TorrentProviderEnum} from './torrent-provider-enum';

export interface DownloadTorrentDto {
  provider: TorrentProviderEnum;
  torrentInfos: ScrapperTorrentInfos,
  mediaInfos: MediaInfos,
  user: any;
}

