// Import Admin SDK
const admin = require("firebase-admin");
const realdebrid = require('../realdebrid/debrid_links');
const gdrive = require('../gdrive/gdrive');

// Get a database reference to our blog
const db = admin.database();
const usersRef = db.ref("/users");

module.exports = (app) => {

    /**
     * Get user settings from database
     */
    app.get('/api/settings', async (req, res) => {

        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            const snapshot = await usersRef.child(user.uid).child('/settings').once('value');
            res.send({settings: snapshot.val()});
        } catch(error) {
            res.status(500).send({message: error});
        }

    });

    /**
     * Store new user settings to database
     */
    app.post('/api/settings', async (req, res) => {

        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            await usersRef.child(user.uid).child('/settings/nas').set(req.body.nas);
            await usersRef.child(user.uid).child('/settings/qualities').set(req.body.qualities);
            await usersRef.child(user.uid).child('/settings/storage').set(req.body.storage);
            await usersRef.child(user.uid).child('/settings/gdrive/moviesGdriveFolder').set(req.body.gdrive.moviesGdriveFolder);
            await usersRef.child(user.uid).child('/settings/gdrive/tvShowsGdriveFolder').set(req.body.gdrive.tvShowsGdriveFolder);
            res.send({message: 'Settings changed'});
        } catch(error) {
            res.status(500).send({message: error});
        }

    });

    /**
     * Link/connect Realdebrid user
     */
    app.get('/api/link', async (req, res) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            const code = req.query.code;
            await realdebrid.connectUser(code, user.uid);
            res.send({message: 'Connected'});
        } catch(error) {
            res.status(500).send({message: error});
        }
    });

    /**
     * Disconnect Realdebrid user
     */
    app.get('/api/unlink', async (req, res) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            await usersRef.child(user.uid).child('/settings').child('realdebrid').remove();
            res.send({message: 'Disconnected'});
        } catch(error) {
            res.status(500).send({message: error});
        }
    });

    /**
     * Gets and stores a Gdrive access token to database from single use client token
     */
    app.post('/api/gdrive_auth', async (req, res) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            const code = req.body.code;
            await gdrive.getGDriveAccessToken(code, user);
            res.send({
                message: 'Connected'
            });
        } catch(error) {
            res.status(500).send({message: error})
        }
    });

    /**
     * Removes Google Drive rest API token from DB (TODO: should also invalidate this token)
     */
    app.get('/api/gdrive_disconect', async (req, res) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            await usersRef.child(user.uid).child('/settings/gdrive/token').remove();
            res.send({
                message: 'Disconnected'
            });
        } catch(error) {
            res.status(500).send({message: error})
        }
    });

    /**
     * Gets and stores a Gdrive access token to database from single use client token
     */
    app.get('/api/gdrive_list', async (req, res) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            await gdrive.listFiles(user);
            res.send({
                message: 'Foo'
            });
        } catch(error) {
            res.status(500).send({message: error})
        }
    });
};