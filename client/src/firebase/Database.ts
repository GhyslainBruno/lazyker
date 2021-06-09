import firebase from 'firebase/app';
import 'firebase/database';
import {StorageEnum} from '../ducks/storage/Storage.enum';
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


}
