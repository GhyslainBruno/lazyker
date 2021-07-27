import firebase from 'firebase/app';
import 'firebase/database';
import {StorageEnum} from '../ducks/storages/Storage.enum';
import {DebriderEnum} from '../ducks/torrents/debrider.enum';
import * as auth from './auth';

export class Database {

  static userRef = firebase.database().ref('/users');

  static async getSelectedStorage(): Promise<StorageEnum> {
    const storageSnapshot = await this.userRef
      .child(await auth.getUid())
      .child('settings')
      .child('storage')
      .child('selected')
      .once('value');

    return storageSnapshot.val() as StorageEnum
  }

  static async getSelectedDebrider(): Promise<DebriderEnum> {
    const selectedStorage = await Database.getSelectedStorage();

    switch (selectedStorage) {
      case StorageEnum.UPTOBOX: {
        return DebriderEnum.ALLDEBRID;
      }

      case StorageEnum.GOOGLE_DRIVE: {
        return DebriderEnum.REALDEBRID;
      }

      case StorageEnum.NAS: {
        return DebriderEnum.REALDEBRID;
      }

      default: {
        return DebriderEnum.REALDEBRID;
      }
    }

  }

}
