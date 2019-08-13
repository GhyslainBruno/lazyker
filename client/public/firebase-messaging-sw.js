importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyAec0nB-wc2G1LizG7P6OWlTsp7hAc5wpg",
    authDomain: "gamification-d5b83.firebaseapp.com",
    databaseURL: "https://gamification-d5b83.firebaseio.com",
    projectId: "gamification-d5b83",
    storageBucket: "gamification-d5b83.appspot.com",
    messagingSenderId: "162007142775"
});
const messaging = firebase.messaging();
