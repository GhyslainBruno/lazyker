const admin = require('firebase-admin');
const serviceAccount = require("./lazyker-568c4-firebase-adminsdk-b7xs7-03f3744551");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://lazyker-568c4.firebaseio.com"
});

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// For CORS error
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


/**
 * Settings routes declaration
 */
require('./api/Settings')(app);

/**
 * Shows routes declaration
 */
require('./api/Shows')(app);

/**
 * Movies routes declaration
 */
require('./api/Movies')(app);

/**
 * Downloads routes declaration
 */
require('./api/Downloads')(app);

/**
 * Torrent routes declaration
 */
require('./api/Torrents')(app);

/**
 * Logs routes declaration
 */
require('./api/Logs')(app);



if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, '/client_build')));
    // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, '/client_build', 'index.html'));
    });
}

const server = app.listen(8081, () => {
    console.log('Server is up...')
});


