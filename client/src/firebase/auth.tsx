import { auth } from './firebase';
import firebase from 'firebase/app';

// Sign Up
export const doCreateUserWithEmailAndPassword = (email: any, password: any) => {
    // const localAuth = auth;

    // auth.signInAnonymously()
    //     .then(result => {
    //
    //         const credential = localAuth.EmailAuthProvider.credential(email, password);
    //
    //         localAuth.currentUser.linkAndRetrieveDataWithCredential(credential)
    //             .then(userCred => {
    //                 const user = userCred.user;
    //                 console.log('Successfully upgraded', user);
    //             })
    //             .catch(error => {
    //                 console.log('Error upgrading anonymous account', error);
    //             })
    //     })
    //     .catch(error => {
    //         console.log(error);
    //     });


    // return auth.signInAnonymously();


    return auth.createUserWithEmailAndPassword(email, password);
};

// export const linkAnonymousEmailAccounts = () => {
//     const credential = auth.EmailAuthProvider.credential('ghyslainbruno@gmail.com', 'foobar')
//         .catch(error => {
//             console.log(error);
//         });
//
//     return auth.currentUser.linkAndRetrieveDataWithCredential(credential)
//         .then(userCred => {
//             const user = userCred.user;
//             console.log('Successfully upgraded', user);
//         })
//         .catch(error => {
//             console.log('Error upgrading anonymous account', error);
//         })
// };

// Sign In
export const doSignInWithEmailAndPassword = (email: any, password: any) => {
    return auth.signInWithEmailAndPassword(email, password);
};

// Sign In with Google provider
export const signInWithGoogle = async () => {
    return auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
};

// Sign In with Facebook provider
export const signInWithFacebook = () => {
    return auth.signInWithRedirect(new firebase.auth.FacebookAuthProvider());
};

// Sign out
export const doSignOut = () =>
    auth.signOut();

// Password Reset
export const doPasswordReset = (email: any) =>
    auth.sendPasswordResetEmail(email);

// Password Change
export const doPasswordUpdate = (password: any) =>
    auth.currentUser?.updatePassword(password);

// Getting user idToken to get authenticated by backend
export const getIdToken = async (): Promise<string> => {
    try {
        return await auth.currentUser!.getIdToken(true);
    } catch(error) {
        throw error;
    }
};

// Getting user uid to connect realdebrid - is not best practice at all TODO: should be changed
export const getUid = (): string => {
    try {
        return auth.currentUser!.uid;
    } catch(error) {
        throw error;
    }
};





// Test to export provider
export const facebookProvider = () => {
    return new firebase.auth.FacebookAuthProvider();
};

