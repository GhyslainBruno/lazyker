import admin from 'firebase-admin';

export class User {

  uid: string;

  constructor(user: admin.auth.DecodedIdToken) {
    this.uid = user.uid
  }

}
