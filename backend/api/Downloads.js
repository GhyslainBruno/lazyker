const admin = require("firebase-admin");
const rp = require('request-promise');
const db = admin.database();
const usersRef = db.ref("/users");
const downloader = require('../synology/Download');
const synoConnector = require('../synology/Connector');

const tmdbApiKey = '7d7d89a7c475b8fdc9a5203419cb3964';
const searchTvTmdbUrl = 'https://api.themoviedb.org/3/search/tv';

module.exports = (app) => {

    /**
     * Load all movies in progress (download not started yet - basically checking/finding good download links)
     */
    app.get('/api/movies_in_progress', async (req, res) => {

        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            const snapshot = await usersRef.child(user.uid).child('/movies').once('value');
            const movies = snapshot.val();

            if (movies) {
                res.send({moviesInProgress: movies, total: Object.keys(movies).length});
            } else {
                res.send({total: 0});
            }

        } catch(error) {
            res.status(500).send({message: error});
        }
    });

    /**
     * Remove a movie from in progress part
     */
    app.post('/api/remove_in_progress_movie', async (req, res) => {

        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            await usersRef.child(user.uid).child('/movies').child(req.body.movie.id).remove();

            const snapshot = await usersRef.child(user.uid).child('/movies').once('value');
            const movies = snapshot.val();

            if (movies) {
                res.send({moviesInProgress: movies, total: Object.keys(movies).length});
            } else {
                res.send({total: 0});
            }

        } catch(error) {
            res.status(500).send({message: error});
        }
    });

    /**
     * List all downloader current downloads - TODO: abstract synology to a generic downloader
     */
    app.get('/api/current_downloads', async (req, res) => {

        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            const currentDownloads = await downloader.getCurrentDownloads(await synoConnector.getConnection(user));

            currentDownloads.tasks.map(download => {
                download.size_downloaded = download.additional.transfer.size_downloaded;
                download.destination = currentDownloads.tasks[0].additional.detail.destination;
            });

            res.send({
                currentDownloads: currentDownloads.tasks
            })
        } catch(error) {
            res.send({
                message: error
            })
        }

    });

    /**
     * Resume a particular download
     */
    app.post('/api/resume_download', async (req, res) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            const message = await downloader.resumeDownload(await synoConnector.getConnection(user), req.body.id);
            res.send({
                message: message
            })
        } catch(error) {
            res.send({
                message: error
            })
        }
    });

    /**
     * Remove a particular download
     */
    app.post('/api/remove_download', async (req, res) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            const message = await downloader.removeDownload(await synoConnector.getConnection(user), req.body.id);
            res.send({
                message: message
            })
        } catch(error) {
            res.send({
                message: error
            })
        }
    });

    /**
     * Pause a particular download
     */
    app.post('/api/pause_download', async (req, res) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            const message = await downloader.pauseDownload(await synoConnector.getConnection(user), req.body.id);
            res.send({
                message: message
            })
        } catch(error) {
            res.send({
                message: error
            })
        }
    });

};