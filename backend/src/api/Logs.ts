import * as logger from '../logs/logger';
import * as admin from 'firebase-admin';

module.exports = (app: any) => {

    /**
     * Retrieves the stackdriver logs
     */
    app.get('/api/logs', async (req: any, res: any) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            const logs = await logger.getLogs(user);
            res.send(logs[0]);
        } catch(error) {
            res.status(500).send({message: error})
        }
    });

    /**
     * Deletes the stackdriver logs
     */
    app.delete('/api/logs', async (req: any, res: any) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            await logger.clearLogs(user);
            res.send({message: 'Logs cleared'});
        } catch(error) {

            if (error.code === 5) {
                res.send({message: 'No logs to be cleared'});
            } else {
                res.status(500).send({message: error})
            }

        }
    });

};
