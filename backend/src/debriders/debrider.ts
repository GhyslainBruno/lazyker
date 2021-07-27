import {Database} from '../database/database';
import {DebridersEnum} from '../entities/debriders.enum';
import {TorrentToFrontDTO} from '../dtos/torrent-to-front.dto';
import {MediaInfos} from '../entities/media-infos';
import {StorageEnum} from '../entities/storage.enum';
import {TorrentInDebriderInfos} from '../entities/torrent-in-debrider-infos';
import {User} from '../entities/user';
import {IStorage} from '../storage/i-storage';
import {Uptobox} from '../storage/uptobox/uptobox';
import {AllDebrid} from './alldebrid/alldebrid-debrider';
import {IDebrider} from './i-debrider';
import * as realdebrid from './realdebrid/debrid_links';

export class Debrider {

  user: User;
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
  constructor(debriderType: new (...args: any[]) => any, storageType: new (...args: any[]) => any, user: User) {

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

  async addMagnet(magnetLink: string, mediaInfos: MediaInfos, user: User): Promise<TorrentInDebriderInfos> {
    const torrentInDebriderInfos = await this.debrider.addMagnetLink(magnetLink, user);
    await Database.storeDownloadedTorrentInDebrider(user, torrentInDebriderInfos, mediaInfos);
    return torrentInDebriderInfos;
  }

  static async getTorrents(user: User): Promise<TorrentToFrontDTO[]> {

    const selectedDebrider = await Database.getSelectedDebrider(user);

    // Selecting debrider service based on storages, for now
    // (later it should be a property juste like storages)
    switch (selectedDebrider) {
      case DebridersEnum.ALLDEBRID: {
        return await AllDebrid.listTorrents(user);
      }

      case DebridersEnum.REALDEBRID: {
        return await realdebrid.getTorrents(user)
      }

      default: {

        break;
      }
    }
  }

  static async deleteTorrent(user: User, torrentId: string, debrider: DebridersEnum): Promise<void> {

    switch (debrider) {
      case DebridersEnum.ALLDEBRID: {
        return await AllDebrid.deleteTorrent(user, torrentId);
      }

      case DebridersEnum.REALDEBRID: {
        return await realdebrid.deleteTorrent(user, torrentId);
      }

      default: {
        throw new Error('Unknown storages');
      }
    }
  }

}
