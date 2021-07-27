import * as admin from 'firebase-admin';
import {DownloadedTorrentInDb} from '../entities/downloaded-torrent-in-db';
import {MediaInfos} from '../entities/media-infos';
import {StorageEnum} from '../entities/storage.enum';
import {TorrentInDebriderInfos} from '../entities/torrent-in-debrider-infos';
import {User, UserSettings} from '../entities/user';
import {Torrent} from '../scrappers/ygg/torrent';
import {DebriderEnum} from './debrider-enum';

export class Database {

  static db = admin.database();
  static usersRef = Database.db.ref("/users");

  static async store(user: User, path: string, objectToStore: any):Promise<any> {
    return await Database.usersRef
      .child(user.uid)
      .child(path)
      .set(objectToStore);
  }

  static async storeAlldebridApiKey(user: User, debrider: DebriderEnum, apiKey: any): Promise<any> {
    return await Database.usersRef
      .child(user.uid)
      .child('settings')
      .child('debriders')
      .child(debrider)
      .set({apiKey: apiKey});
  }

  static async removeDebrider(user: User, debrider: DebriderEnum) {
    return await Database.usersRef
      .child(user.uid)
      .child('settings')
      .child('debriders')
      .child(debrider)
      .remove();
  }

  static async getSelectedStorage(user: User): Promise<StorageEnum> {
    const storageSnapshot = await Database.usersRef
      .child(user.uid)
      .child('settings')
      .child('storage')
      .child('selected')
      .once('value');

    return storageSnapshot.val() as StorageEnum
  }

  // static async uptoboxToken(user: User): Promise<string> {
  //   const snapshot = await Database.usersRef.child(user.uid).child('settings').child('storages').child('uptobox').child('token').once('value');
  //   return snapshot.val();
  // }

  static async getUserSettings(user: User): Promise<UserSettings> {
    const snapshot = await Database.usersRef.child(user.uid).child('settings').once('value');
    return snapshot.val();
  }

  static async getAlldebridApiKey(user: User): Promise<string> {
    const storageSnapshot = await Database.usersRef
        .child(user.uid)
        .child('settings')
        .child('debriders')
        .child('alldebrid')
        .child('apiKey')
        .once('value');

    return storageSnapshot.val();
  }

  static async storeDownloadedTorrentInDebrider(user: User, torrent: TorrentInDebriderInfos, mediaInfos: MediaInfos):Promise<void> {
    const downloadedTorrentInDb = new DownloadedTorrentInDb(mediaInfos, torrent);
    return await Database.store(user, `/torrentsDownloadedInDebrider/${user.settings.debriders.selected}/${downloadedTorrentInDb.id}`,downloadedTorrentInDb);
  }

}
