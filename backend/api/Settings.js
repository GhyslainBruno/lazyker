// Import Admin SDK
const admin = require("firebase-admin");
const realdebrid = require('../realdebrid/debrid_links');

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
            await usersRef.child(user.uid).child('/settings').set(req.body);
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
};