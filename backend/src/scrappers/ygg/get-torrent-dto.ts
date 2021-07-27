import { TorrentProviderEnum } from './torrent-provider-enum';

export class GetTorrentDto {
  provider: TorrentProviderEnum;
  title: string;
  url: string;
  size: number;
  seed: number;
  leech: number;

  constructor(provider: TorrentProviderEnum, title: string, ur: string, size: number, seed: number, leech: number) {
    this.provider = provider;
    this.title = title;
    this.size = size;
    this.seed = seed;
    this.leech = leech
  }
}
