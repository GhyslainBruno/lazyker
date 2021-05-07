import {TorrentInDebriderInfos} from '../entities/torrent-in-debrider-infos';
import {User} from '../entities/user';
import {IStorage} from '../storage/i-storage';
import {Uptobox} from '../storage/uptobox/uptobox';
import {AllDebrid} from './alldebrid/alldebrid-debrider';
import {IDebrider} from './i-debrider';

export class Debrider {

  user: any;
  debrider: IDebrider;
  storage: IStorage;
  token: string;

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

  async addMagnet(magnetLink: string, user: any): Promise<TorrentInDebriderInfos> {
    return await this.debrider.addMagnetLink(magnetLink, user);
  }

  // async connectUser(user: User): Promise<string> {
  //
  //   switch (typeof this.debrider) {
  //     case AllDebrid:
  //       return await this.debrider.connectUser(user);
  //       break;
  //
  //     default:
  //       break;
  //   }
  // }

}
