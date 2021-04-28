import { TorrentProviderEnum } from './torrent-provider-enum';

export class Torrent {
  provider: TorrentProviderEnum;
  title: string;
  url: string;
  size: number;
  seed: number;
  leech: number;

  // torrent-search-api lib part
  time: string;
  magnet: string;
  desc: string;

  constructor(provider: TorrentProviderEnum, title: string, url: string, size: number, seed: number, leech: number, time: string, magnet: string, desc: string) {
    this.provider = provider;
    this.title = title;
    this.url = url;
    this.size = size;
    this.seed = seed;
    this.leech = leech;
    this.time = time;
    this.magnet = magnet;
    this.desc = desc;
  }
}
