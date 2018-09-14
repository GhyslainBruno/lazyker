const express = require('express');
const Syno = require('syno');
const SynoPerso = require('./synology/SynoPerso');
const bodyParser = require('body-parser');
const jsonDB = require('node-json-db');
fork = require('child_process').fork;
const rp = require('request-promise');
const _ = require('lodash');
const fs = require('fs');
const downloader = require('./synology/download');
const logger = require('./logs/logger');
const path = require('path');
const realdebrid = require('./realdebrid/debrid_links');
const synoConnector = require('./synology/Connector');

const tmdbApiKey = '7d7d89a7c475b8fdc9a5203419cb3964';
const searchTvTmdbUrl = 'https://api.themoviedb.org/3/search/tv';

const db = new jsonDB("database.json", true, true);
db.reload();
// const tmdbApiKey = '7d7d89a7c475b8fdc9a5203419cb3964';
// const searchTvTmdbUrl = 'https://api.themoviedb.org/3/search/tv';
const searchMovieTmdbUrl = 'https://api.themoviedb.org/3/search/movie';
const youtubeAPIKey = 'AIzaSyDJUXgEKJSwbsr_Gj7IuWTNlTPoGKP_xn8';

const dlprotect = require('./movies/scappers/zonetelechargementlol/dlprotect1co');
const Movies = require('./movies/Movies');

//Using firebase
const admin = require('firebase-admin');
const serviceAccount = require("./lazyker-568c4-firebase-adminsdk-b7xs7-03f3744551");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://lazyker-568c4.firebaseio.com"
});


const app = express();

// let syno = new Syno({
//     // Requests protocol : 'http' or 'https' (default: http)
//     protocol: db.getData('/configuration/nas/protocol'),
//     // DSM host : ip, domain name (default: localhost)
//     host: db.getData('/configuration/nas/host'),
//     // DSM port : port number (default: 5000)
//     port: db.getData('/configuration/nas/port'),
//     // DSM User account (required)
//     account: db.getData('/configuration/nas/account'),
//     // DSM User password (required)
//     passwd: db.getData('/configuration/nas/password'),
//     // DSM API version (optional, default: 6.0.2)
//     apiVersion: '6.0.2'
// });

let autoUpdateChild = {};
let moviesChild = {};

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


// require('./api/User')(app);

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



app.get('/api/autoupdate_state', function(req, res) {
    res.send(db.getData('/states').autoUpdate)
});

app.get('/api/autoupdate', function(req, res) {
    if (req.query.start) {

        db.reload();
        db.push('/states/autoUpdate', true);

        autoUpdateChild = fork('AutoUpdate.js', {execArgv: ['--inspect=6001']})
            .on('close', (data) => {
                db.reload();
                db.data.states.autoUpdate = false;
                db.save();
            })
            .on('error', (data) => {
                db.reload();
                db.data.states.autoUpdate = false;
                db.save();
            });

        res.send(db.getData('/states').autoUpdate)

    } else if (req.query.stop) {
        autoUpdateChild.kill();
        db.push('/states/autoUpdate', false);
        res.send(db.getData('/states').autoUpdate)
    } else {
        res.send('ERROR (bad parameters)')
    }
});

app.get('/api/autoupdate_output', async (req, res) => {

    fs.readFile('logs/stdout.txt', 'utf8', function (err,data) {
        if (err) {
            res.send(err);
        } else {
            let dataToSend = {output: data};
            res.send(dataToSend)
        }
    });
});



/**
 * Get list of torrents for a particular title
 */
app.get('/api/torrents', async (req, res) => {
    try {
        res.send(await Movies.getTorrentsList(req.query.title));
    } catch(error) {
        res.status(500).send({
            message: error
        })
    }
});

/**
 * Download a torrent file using page url
 */
app.post('/api/torrents', async (req, res) => {
    try {
        await Movies.downloadTorrentFile(req.body.url);
        res.send({message: 'ok'});
    } catch(error) {
        res.status(500).send({
            message: error
        })
    }
});

/**
 * Get list of torrents in realdebrid service
 */
app.get('/api/realdebrid_torrents', async (req, res) => {
    try {
        res.send(await realdebrid.getTorrents());
    } catch(error) {
        res.status(500).send({
            message: error
        })
    }
});

app.post('/api/realdebrid_torrent_download', async (req, res) => {
    try {
        await downloader.startRealdebridTorrentDownload(req.body.torrent, req.body.torrent.filename.replace(/\.[^/.]+$/, ""));
        res.send({
            message: 'ok'
        });
    } catch(error) {
        res.status(500).send({
            message: error
        })
    }
});

/**
 * Remove a particular realdebrid torrent
 */
app.delete('/api/realdebrid_torrents', async (req, res) => {
    try {
        await realdebrid.deleteTorrent(req.query.torrentId);
        res.send({
            message: 'ok'
        });
    } catch(error) {
        res.status(500).send({
            message: error
        })
    }
});


app.get('/api/current_downloads', async (req, res) => {

    try {
        const currentDownloads = await downloader.getCurrentDownloads(await synoConnector.getConnection());

        res.send({
            currentDownloads: currentDownloads
        })
    } catch(error) {
        res.send({
            message: error
        })
    }

});

app.post('/api/resume_download', async (req, res) => {
    try {
        const message = await downloader.resumeDownload(await synoConnector.getConnection(), req.body.id);
        res.send({
            message: message
        })
    } catch(error) {
        res.send({
            message: error
        })
    }
});

app.post('/api/remove_download', async (req, res) => {
    try {
        const message = await downloader.removeDownload(await synoConnector.getConnection(), req.body.id);
        res.send({
            message: message
        })
    } catch(error) {
        res.send({
            message: error
        })
    }
});

app.post('/api/pause_download', async (req, res) => {
    try {
        const message = await downloader.pauseDownload(await synoConnector.getConnection(), req.body.id);
        res.send({
            message: message
        })
    } catch(error) {
        res.send({
            message: error
        })
    }
});



app.post('/api/clear_logs', (req, res) => {
    fs.writeFile('logs/stdout.txt', '', function(){
        res.send({message: 'logs cleared'});
    });
});

app.get('/api/movies_genres', async (req, res) => {
    
    const options = {
        method: 'GET',
        uri: 'https://api.themoviedb.org/3/genre/movie/list' + '?api_key=' + tmdbApiKey,
        json: true
    };

    try {
        const results = await rp(options);

        res.send(results.genres)
    }
    catch(error) {
        res.send(error)
    }
});

app.get('/api/movie_info', async (req, res) => {
    const id = req.query.id;

    const options = {
        method: 'GET',
        uri: url = 'https://api.themoviedb.org/3/movie/' + id + '?api_key=' + tmdbApiKey + '&language=fr-FR',
        json: true
    };

    // Using TMDB as a trailer provider
    // const optionsTrailer = {
    //     method: 'GET',
    //     uri: url = 'https://api.themoviedb.org/3/movie/' + id + '/videos' + '?api_key=' + tmdbApiKey + '&language=en-EN',
    //     json: true
    // };


    try {
        let movieInfo = await rp(options);

        // Using youtube as a trailer provider
        const optionsTrailer = {
            method: 'GET',
            uri: 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=' + movieInfo.title + '&type=video&key=' + youtubeAPIKey,
            json: true
        };

        let movieTrailer = await rp(optionsTrailer);

        if (movieTrailer.items.length > 0) {
            movieInfo['trailer'] = 'https://www.youtube.com/watch?v=' + movieTrailer.items[0].id.videoId;
        } else {
            movieInfo['trailer'] = false;
        }

        res.send(movieInfo)
    }
    catch(error) {
        res.send(error)
    }
});

if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));
    // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

const server = app.listen(8081);


