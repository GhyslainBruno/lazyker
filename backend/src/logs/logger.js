// Imports the Google Cloud client library
const Logging = require('@google-cloud/logging');
// Your Google Cloud Platform project ID
const projectId = 'lazyker-568c4';
// Creates a client
const logging = new Logging({
    keyFilename: './backend/logs/lazyker-1eebc13a0386.json',
    projectId: projectId,
});

/**
 * Write a log for a particular user
 * @param textToLog
 * @param user
 * @returns {Promise<void>}
 */
const info = async (textToLog, user) => {

    if (textToLog !== '') {
        // The name of the log to write to
        const logName = user.uid;
        // Selects the log to write to
        const log = logging.log(logName);

        // The data to write to the log
        let text = "";
        if (textToLog.message) {
            text = textToLog.message
        } else {
            text = textToLog
        }

        // The metadata associated with the entry
        const metadata = {resource: {type: 'global'}};
        // Prepares a log entry
        const entry = log.entry(metadata, text);

        // Writes the log entry
        log
            .write(entry)
            .then(() => {
                return null
            })
            .catch(error => {
                throw error
            });
    }

};

/**
 * Clears the user's logs
 * @param user
 * @returns {Promise<DeleteLogResponse>}
 */
const clearLogs = async user => {

    // The name of the log to write to
    const logName = user.uid;
    // Selects the log to write to
    const log = logging.log(logName);

    try {
        return await log.delete();
    } catch(error) {
        throw error
    }

};

/**
 * Get all logs for a particular user
 * @param user
 * @returns {Promise<GetEntriesResponse>}
 */
const getLogs = async user => {
    // The name of the log to write to
    const logName = user.uid;
    // Selects the log to write to
    const log = logging.log(logName);

    // Getting the Stackdriver logs
    try {
        return await log.getEntries();
    } catch(error) {
        throw error;
    }
};

module.exports.info = info;
module.exports.getLogs = getLogs;
module.exports.clearLogs = clearLogs;