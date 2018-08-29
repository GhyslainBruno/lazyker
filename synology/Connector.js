const Syno = require('syno');
const jsonDB = require('node-json-db');

/**
 * Returns a good Syno (Synology connection) object every time
 * @returns {Promise<void>}
 */
const getConnection = async () => {

    const db = new jsonDB("database.json", true, true);
    db.reload();

    return new Syno({
        // Requests protocol : 'http' or 'https' (default: http)
        protocol: db.getData('/configuration/nas/protocol'),
        // DSM host : ip, domain name (default: localhost)
        host: db.getData('/configuration/nas/host'),
        // DSM port : port number (default: 5000)
        port: db.getData('/configuration/nas/port'),
        // DSM User account (required)
        account: db.getData('/configuration/nas/account'),
        // DSM User password (required)
        passwd: db.getData('/configuration/nas/password'),
        // DSM API version (optional, default: 6.0.2)
        apiVersion: '6.0.2'
    });
};

module.exports.getConnection = getConnection;