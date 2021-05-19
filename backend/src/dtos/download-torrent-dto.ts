import {MediaInfos} from '../entities/media-infos';
import {ScrapperTorrentInfos} from '../entities/scrapper-torrent-infos';
import {User} from '../entities/user';
import {TorrentProviderEnum} from '../scrappers/ygg/torrent-provider-enum';

export interface DownloadTorrentDto {
  provider: TorrentProviderEnum;
  torrentInfos: ScrapperTorrentInfos,
  mediaInfos: MediaInfos,
  user: User;
}

