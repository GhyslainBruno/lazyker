import admin from 'firebase-admin';

declare namespace Express {
  import DecodedIdToken = admin.auth.DecodedIdToken;

  export interface Request {
    user?: DecodedIdToken
  }
}
