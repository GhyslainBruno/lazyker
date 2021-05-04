export class TorrentInDebriderInfos {
  id: number;
  isReady: boolean;

  constructor(id: number, isReady: boolean) {
    this.id = id;
    this.isReady = isReady;
  }
}
