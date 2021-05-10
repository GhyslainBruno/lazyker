import firebase from 'firebase/app';
import firebaseMessaging from 'firebase';
import 'firebase/auth';
// import database from 'firebase/database';

const config = {
    apiKey: "AIzaSyCRqR1Mc3oQFPgQPgsKTbRBIBz1-UbCqcI",
    authDomain: "lazyker-568c4.firebaseapp.com",
    databaseURL: "https://lazyker-568c4.firebaseio.com",
    projectId: "lazyker-568c4",
    storageBucket: "lazyker-568c4.appspot.com",
    messagingSenderId: "348584284"
};

// Similar to a singleton pattern
if (!firebase.apps.length) {
    firebase.initializeApp(config);

    navigator.serviceWorker
        .register('src/registerServiceWorker.tsx')
        .then((registration) => {
            firebaseMessaging.messaging().useServiceWorker(registration);
        });

    // Commenting this part for using lazyker on iOS
    //const messaging = firebaseMessaging.messaging();

    //messaging.requestPermission()
        //.then( () => {
            //console.log('have persmission');
            //return messaging.getToken();
        //})
        //.then(token => {
            //console.log(token);
        //})
        //.catch(error => {
            //console.log(error);
        //})
}

// Export the auth firebase api
const auth = firebase.auth();

export {
    auth
};

// export {
//     database
// };
