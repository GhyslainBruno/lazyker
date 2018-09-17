// Imports the Google Cloud client library
const Logging = require('@google-cloud/logging');
// Your Google Cloud Platform project ID
const projectId = 'lazyker-568c4';
// Creates a client
const logging = new Logging({
    keyFilename: './lazyker-1eebc13a0386.json',
    projectId: projectId,
});

/**
 * Write a log for a particular user
 * @param textToLog
 * @param user
 * @returns {Promise<void>}
 */
const info = async (textToLog, user) => {
    // The name of the log to write to
    const logName = user.uid;
    // Selects the log to write to
    const log = logging.log(logName);

    // The data to write to the log
    const text = textToLog;
    // The metadata associated with the entry
    const metadata = {resource: {type: 'global'}};
    // Prepares a log entry
    const entry = log.entry(metadata, text);

    // Writes the log entry
    log
        .write(entry)
        .then(() => {
            console.log(`Logged: ${text}`);
            return null
        })
        .catch(err => {
            console.error('ERROR:', err);
            throw error
        });
};

/**
 * Get all logs for a particular user
 * @param user
 * @returns {Promise<void>}
 */
const getLogs = async user => {
    // The name of the log to write to
    const logName = user.uid;
    // Selects the log to write to
    const log = logging.log(logName);

    // Gettings the stackdriver logs
    try {
        return await log.getEntries();
    } catch(error) {
        throw error;
    }
};

module.exports.info = info;
module.exports.getLogs = getLogs;