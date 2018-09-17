// Import Admin SDK
const admin = require("firebase-admin");

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
};