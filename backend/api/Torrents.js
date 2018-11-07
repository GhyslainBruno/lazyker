const realdebrid = require('../realdebrid/debrid_links');
const admin = require("firebase-admin");
const Movies = require('../movies/Movies');
// const downloader = require('../synology/Download');
const downloader = require('../downloads/downloader');

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
            // await downloader.startRealdebridTorrentDownload(req.body.torrent, req.body.torrent.filename.replace(/\.[^/.]+$/, ""), user);
            await downloader.startRealdebridTorrentDownload(req.body.torrent, req.body.torrent.filename.replace(/\.[^/.]+$/, ""), user);
            res.send({
                message: 'ok'
            });
        } catch(error) {
            res.status(500).send({
                message: JSON.parse(JSON.stringify(error))
            })
        }
    });

    /**
     * Get straming links for a particular realdebrid torrent
     */
    app.post('/api/streaming_torrent', async (req, res) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            const unrestrictedTorrent = await realdebrid.unrestricLinkNoDB(req.body.link, user);

            if (unrestrictedTorrent.streamable === 1) {
                res.send({
                    streamingLink: 'https://real-debrid.com/streaming-' + unrestrictedTorrent.id
                })
            } else {
                res.status(500).send({
                    error: 'File not streamable'
                })
            }

        } catch (error) {
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
