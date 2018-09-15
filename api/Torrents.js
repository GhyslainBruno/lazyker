// import * as realdebrid from "../realdebrid/debrid_links";
const realdebrid = require('../realdebrid/debrid_links');
const admin = require("firebase-admin");
const rp = require('request-promise');
const db = admin.database();
const usersRef = db.ref("/users");
const Movies = require('../movies/Movies');
const downloader = require('../synology/Download');

const tmdbApiKey = '7d7d89a7c475b8fdc9a5203419cb3964';
const searchTvTmdbUrl = 'https://api.themoviedb.org/3/search/tv';

module.exports = (app) => {

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
            const user = await admin.auth().verifyIdToken(req.headers.token);
            await Movies.downloadTorrentFile(req.body.url, user);
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
            const user = await admin.auth().verifyIdToken(req.headers.token);
            res.send(await realdebrid.getTorrents(user));
        } catch(error) {
            res.status(500).send({ message: error })
        }
    });

    /**
     * Download the file into the user's library (precedently torrented in debrider's pool)
     */
    app.post('/api/realdebrid_torrent_download', async (req, res) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            await downloader.startRealdebridTorrentDownload(req.body.torrent, req.body.torrent.filename.replace(/\.[^/.]+$/, ""), user);
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
            const user = await admin.auth().verifyIdToken(req.headers.token);
            await realdebrid.deleteTorrent(req.query.torrentId, user);
            res.send({
                message: 'ok'
            });
        } catch(error) {
            res.status(500).send({
                message: error
            })
        }
    });

};
