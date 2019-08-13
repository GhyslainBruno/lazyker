import firebase from 'firebase/app';
import firebaseMessaging from 'firebase';
import 'firebase/auth';
import database from 'firebase/database';

const config = {
    apiKey: "AIzaSyAec0nB-wc2G1LizG7P6OWlTsp7hAc5wpg",
    authDomain: "gamification-d5b83.firebaseapp.com",
    databaseURL: "https://gamification-d5b83.firebaseio.com",
    projectId: "gamification-d5b83",
    storageBucket: "gamification-d5b83.appspot.com",
    messagingSenderId: "162007142775"
};

// Similar to a singleton pattern
if (!firebase.apps.length) {
    firebase.initializeApp(config);

    navigator.serviceWorker
        .register('src/registerServiceWorker.js')
        .then((registration) => {
            firebaseMessaging.messaging().useServiceWorker(registration);
        });

    // Commenting this part for using lazyker on iOS
    const messaging = firebaseMessaging.messaging();

    messaging.requestPermission()
        .then( () => {
            console.log('have persmission');
            return messaging.getToken();
        })
        .then(token => {
            console.log(token);
        })
        .catch(error => {
            console.log(error);
        })
}

// Export the auth firebase api
const auth = firebase.auth();

export {
    auth
};

export {
    database
};
