import {Database} from '../database/database';
import {TorrentFromFrontDto} from '../dtos/torrent-from-front.dto';
import {TorrentToFrontDTO} from '../dtos/torrent-to-front.dto';
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

  async addMagnet(magnetLink: string, user: User): Promise<TorrentInDebriderInfos> {
    return await this.debrider.addMagnetLink(magnetLink, user);
  }

  static async getTorrents(user: User): Promise<TorrentToFrontDTO[]> {

    const selectedStorage = await Database.getSelectedStorage(user);

    // Selecting debrider service based on storage, for now
    // (later it should be a property juste like storage)
    switch (selectedStorage) {
      case StorageEnum.UPTOBOX: {
        return await AllDebrid.listTorrents(user);
      }

      case StorageEnum.GOOGLE_DRIVE: {
        return await realdebrid.getTorrents(user)
      }

      default: {

        break;
      }
    }
  }

  static async deleteTorrent(user: User, torrentId: string, storage: StorageEnum): Promise<void> {

    switch (storage) {
      case StorageEnum.UPTOBOX: {
        return await AllDebrid.deleteTorrent(user, torrentId);
      }

      case StorageEnum.GOOGLE_DRIVE: {
        return await realdebrid.deleteTorrent(user, torrentId);
      }

      default: {
        throw new Error('Unknown storage');
      }
    }
  }

}
