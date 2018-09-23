import { auth } from './firebase';

// Sign Up
export const doCreateUserWithEmailAndPassword = (email, password) =>
    auth.createUserWithEmailAndPassword(email, password);

// Sign In
export const doSignInWithEmailAndPassword = (email, password) =>
    auth.signInWithEmailAndPassword(email, password);

// Sign out
export const doSignOut = () =>
    auth.signOut();

// Password Reset
export const doPasswordReset = (email) =>
    auth.sendPasswordResetEmail(email);

// Password Change
export const doPasswordUpdate = (password) =>
    auth.currentUser.updatePassword(password);

// Getting user idToken to get authenticated by backend
export const getIdToken = async () => {
    try {
        return await auth.currentUser.getIdToken(true);
    } catch(error) {
        throw error;
    }
};

// Getting user uid to connect realdebrid - is not best practice at all TODO: should be changed
export const getUid = () => {
    try {
        return auth.currentUser.uid;
    } catch(error) {
        throw error;
    }
};

