const rp = require('request-promise');
const logger = require('../../../logs/logger');
const CLIENT_ID = 'GPA2MB33HLS3I';
const CLIENT_SECRET = '1e56fa016de2d07058c2501737710683a12d3dee';
const authUrlRealDebrid = "https://api.real-debrid.com/oauth/v2/token";
const admin = require("firebase-admin");
const db = admin.database();
const usersRef = db.ref("/users");

/**
 * Connects user to realdebrid using their OAuth process
 * @param code
 * @param user
 * @returns {Promise<void>}
 */
export const connectUser = async (code: any, user: any) => {

    const uid = user.uid;

    const options = {
        method: 'POST',
        uri: authUrlRealDebrid,
        formData: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
            redirect_uri: 'https://lazyker.herokuapp.com/settings',
            grant_type: "authorization_code"
        },
        json: true
    };

    try {
        const token = await rp(options);
        await usersRef.child(uid).child('/settings/realdebrid/token').set(token);
        return token
    } catch(error) {
        await logger.info('Realdebrid connection ERROR - ' + error.message, user);
    }
};


module.exports.connectUser = connectUser;
