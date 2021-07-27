import admin from 'firebase-admin';
import {Database} from '../database/database';
import {DebriderEnum} from '../database/debrider-enum';
import {StorageEnum} from './storage.enum';

export type UserSettings = {
  storage: {
    selected: StorageEnum,
    uptobox: {
      token: string,
      moviesFolder: string
    }
  },
  debriders: {
    selected : DebriderEnum,
    alldebrid: {
      apiKey: string
    }
  }
}

export class User {

  uid: string;
  settings: UserSettings

  constructor(user: admin.auth.DecodedIdToken) {
    this.uid = user.uid;
  }

  async aggregateUserSettings(): Promise<void> {
    this.settings = await Database.getUserSettings(this);
  }

}
