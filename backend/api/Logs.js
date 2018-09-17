const logger = require('../logs/logger');
const admin = require("firebase-admin");

module.exports = (app) => {

    /**
     * Retrieves the stackdriver logs
     */
    app.get('/api/logs', async (req, res) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            const logs = await logger.getLogs(user);
            console.log(logs);
            res.send(logs[0]);
        } catch(error) {
            res.status(500).send({message: error})
        }

    });

    /**
     * Deletes the stackdriver logs
     */
    app.delete('/api/logs', (req, res) => {

    });

};