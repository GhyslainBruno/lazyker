import * as admin from 'firebase-admin';
import {StorageEnum} from '../entities/storage.enum';
import {User, UserSettings} from '../entities/user';
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
  //   const snapshot = await Database.usersRef.child(user.uid).child('settings').child('storage').child('uptobox').child('token').once('value');
  //   return snapshot.val();
  // }

  static async getUserSettings(user: User): Promise<UserSettings> {
    const snapshot = await Database.usersRef.child(user.uid).child('settings').once('value');
    return snapshot.val();
  }

}
