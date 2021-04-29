import {IStorage} from '../storage/i-storage';
import {Uptobox} from '../storage/uptobox/uptobox';
import {AllDebrid} from './alldebrid/alldebrid-provider';
import {IDebrider} from './i-debrider';

export class TorrentId {
  id: number;
  isReady: boolean;

  constructor(id: number, isReady: boolean) {
    this.id = id;
    this.isReady = isReady;
  }
}

export class MovieInfos {
  title: string;
  year: number;

  constructor(title: string, year: number) {
    this.title = title;
    this.year = year;
  }
}

export class Debrider {

  user: any;
  debrider: IDebrider;
  storage: IStorage;

  /**
   * This thread is very helpful to understand this operator
   * https://stackoverflow.com/questions/50726326/how-to-go-about-understanding-the-type-new-args-any-any
   * @param debriderType
   * @param storageType
   * @param user
   */
  // TODO: make it to only use "user" as constructor parameter
  constructor(debriderType: new (...args: any[]) => any, storageType: new (...args: any[]) => any, user: any) {

    switch (storageType) {
      case Uptobox: {
        this.storage = new Uptobox();
        break;
      }

      default: {
        // Statement
        break;
      }

    }
    switch (debriderType) {
      case AllDebrid: {
        this.debrider = new AllDebrid();
        break;
      }

      default: {
        // Statement
        break;
      }

    }

    this.user = user;
  }

  async addMagnet(magnetLink: string, user: any): Promise<TorrentId> {
    return await this.debrider.addMagnetLink(magnetLink, user);
  }

}
