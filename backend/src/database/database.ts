import * as admin from 'firebase-admin';
import {User} from '../entities/user';
import {DebriderEnum} from './debrider-enum';

const db = admin.database();
const usersRef = db.ref("/users");

export class Database {

  static async store(user: User, path: string, objectToStore: any):Promise<any> {
    return await usersRef.child(user.uid).child(path).set(objectToStore);
  }

  static async storeAlldebridApiKey(user: User, debrider: DebriderEnum, apiKey: any): Promise<any> {
    return await usersRef.child(user.uid).child('settings').child('debriders').child(debrider).set({apiKey: apiKey});
  }

}
