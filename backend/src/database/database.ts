import * as admin from 'firebase-admin';

const db = admin.database();
const usersRef = db.ref("/users");

export class Database {

  static async store(user: any, path: string, objectToStore: any):Promise<any> {
    return await usersRef.child(user.uid).child(path).set(objectToStore);
  }

}
