const Syno = require('syno');
const admin = require("firebase-admin");
const db = admin.database();
const usersRef = db.ref("/users");

/**
 * Returns a good Syno (Synology connection) object every time
 * @returns {Promise<void>}
 */
export const getConnection = async (user: any) => {

    try{
        const snapshot = await usersRef.child(user.uid).child('/settings/nas').once('value');
        const nasConfiguration = snapshot.val();

        return new Syno({
            // Requests protocol : 'http' or 'https' (default: http)
            protocol: nasConfiguration.protocol,
            // DSM host : ip, domain name (default: localhost)
            host: nasConfiguration.host,
            // DSM port : port number (default: 5000)
            port: nasConfiguration.port,
            // DSM User account (required)
            account: nasConfiguration.account,
            // DSM User password (required)
            passwd: nasConfiguration.password,
            // DSM API version (optional, default: 6.0.2)
            apiVersion: '6.0.2'
        });
    } catch(error) {
        throw error;
    }

};

module.exports.getConnection = getConnection;
