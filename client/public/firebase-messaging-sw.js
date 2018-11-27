importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyCRqR1Mc3oQFPgQPgsKTbRBIBz1-UbCqcI",
    authDomain: "lazyker-568c4.firebaseapp.com",
    databaseURL: "https://lazyker-568c4.firebaseio.com",
    projectId: "lazyker-568c4",
    storageBucket: "lazyker-568c4.appspot.com",
    messagingSenderId: "348584284"
});
const messaging = firebase.messaging();