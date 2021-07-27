import {NextFunction, Request, Response} from 'express';
import * as admin from 'firebase-admin';
import {User} from '../../entities/user';

export const UserMiddleware = async (request: Request, response: Response, next: NextFunction): Promise<any> => {

  if (request.headers.token) {
    // @ts-ignore
    const firebaseUser = await admin.auth().verifyIdToken(request.headers.token);

    const user = new User(firebaseUser);
    await user.aggregateUserSettings();

    // @ts-ignore
    request.user = user;
    next();
  } else {
    next();
  }
};

// export function routesAuth(): MethodDecorator {

//   return function (
//     target: Object,
//     propertyKey: string | symbol,
//     descriptor: PropertyDescriptor
//   ) {
//     const original = descriptor.value;
//     descriptor.value = function (...args: any[]) {
//
//       const request = args[0] as Request;
//       const response = args[1] as Response;
//
//       const headers = request.headers;
//
//       if (headers.authorization === `Bearer ${key}`) {
//         return original.apply(this, args);
//       }
//       response.status(403).json({error: "Not Authorized"});
//     }
//   }
// }
