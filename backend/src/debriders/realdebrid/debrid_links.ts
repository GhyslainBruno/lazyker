const rp = require('request-promise');
const pFilter = require('p-filter');
const pMap = require('p-map');

const logger = require('../../logs/logger');

// Realdebrid authentication part
const CLIENT_ID = 'GPA2MB33HLS3I';
const CLIENT_SECRET = '1e56fa016de2d07058c2501737710683a12d3dee';
const rootUrlRealDebrid = "https://api.real-debrid.com/rest/1.0";
const authUrlRealDebrid = "https://api.real-debrid.com/oauth/v2/token";

// Firebase part
const admin = require("firebase-admin");
const db = admin.database();
const usersRef = db.ref("/users");

// Using separate files
const rdAuth = require('./authentication/Oauth');


/**
 * Connectiong realdebrid user using OAuth
 * @param code
 * @param user
 * @returns {Promise<void>}
 */
export const connectUser = async (code: any, user: any) => {
    return await rdAuth.connectUser(code, user);
};

/**
 * Get unrestricted links
 * @param links
 * @param user
 * @returns {Promise<*>}
 */
export const getUnrestrictedLinks = async function(links: any, user: any) {
    try {

        const token = await getRealdebridAuthToken(user);

        const regexes = await getRegexes(token);

        const hostsStatus = await getHostsStatus(token);

        if(await areLinksSupported(links, regexes)) {

            if (await areValid(links, token, hostsStatus)) {

                return await unrestrictArrayOfLinks(links, token);

            } else {
                throw 'some links not valid'
            }

        } else {
            throw 'links not supported'
        }


    } catch (error) {
        logger.info(error, user);
        throw error
    }
};

/**
 * Returns the best (and lighter) link from [firstQuality[{host link}], etc..]
 * @param links
 * @param user
 * @returns {Promise<*>}
 */
export const getBetterLink = async function(links: any, user: any) {

    try {

        const token = await getRealdebridAuthToken(user);

        const regexes = await getRegexes(token);

        const hostsStatus = await getHostsStatus(token);

        const supportedLinks = await getSupportedLinks(links, regexes, hostsStatus);

        const availableSupportedLinks = await getAvailableLinks(supportedLinks, token, hostsStatus);

        // If no available links is found, return null
        if (availableSupportedLinks === null) {
            return null
        } else {
            const unrestrictedLinks = await unrestricLinks(availableSupportedLinks, token);

            return await getLighterLink(unrestrictedLinks);
        }

    } catch (error) {
        logger.info(error, user)
    }
};

/**
 * Returns a RealDebrid authentication token to use in (almost) every RealDebrid requests
 * @param user
 * @returns {Promise<any>}
 */
async function getRealdebridAuthToken(user: any) {

    try {
        const uid = user.uid;
        let token = await usersRef
            .child(uid)
            .child('settings')
            .child('debriders')
            .child('realdebrid')
            .child('token')
            .once('value');

        token = token.val();

        if (token) {

            // If has the nodes --> check for validity of token --> if not valid, reauthenticate, store new, and return if valid --> returning token
            const options = {
                uri: rootUrlRealDebrid + '/user',
                qs: {
                    auth_token: token.access_token
                },
                json: true
            };

            try {
                // Checking the validity of the token by fetching user profile
                await rp(options);
                return token
            }
            catch(erorr) {
                const options = {
                    method: 'POST',
                    uri: authUrlRealDebrid,
                    formData: {
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                        code: token.refresh_token,
                        grant_type: "http://oauth.net/grant_type/device/1.0"
                    },
                    json: true
                };

                try {
                    const newToken = await rp(options);
                    await usersRef.child(uid).child('/settings/realdebrid/token').set(newToken);
                    return newToken
                } catch(error) {
                    logger.info('Realdebrid Auth ERROR - ' + erorr, user);
                }
            }
        }
        else {

            // Old way of doing realdebrid auth - now connection using OAuth
            // If no one is present, authenticate and create some
            // let username = await usersRef.child(uid).child('/settings/realdebrid/credentials/username').once('value');
            // username = username.val();
            // let password = await usersRef.child(uid).child('/settings/realdebrid/credentials/password').once('value');
            // password = password.val();
            //
            // const options = {
            //     method: 'POST',
            //     uri: authUrlRealDebrid,
            //     formData: {
            //         client_id: CLIENT_ID,
            //         username: username,
            //         password: password,
            //         grant_type: "password"
            //     },
            //     json: true
            // };
            //
            // try {
            //     const newToken = await rp(options);
            //     await usersRef.child(uid).child('/settings/realdebrid/token').set(newToken);
            //     return newToken
            // } catch(error) {
            //     logger.info(error)
            // }

            logger.info('ERROR : please connect to "Realdebrid" debrider first --> Go to Settings > Configuration and click "connect" to use your Realdebrid account', user);
            throw new Error('Realdebrid connection needed');
        }

    } catch(error) {
        throw error;
    }
}

/**
 * Returns all regexes from RealDebrid - in order to filter a list of links
 * @param token
 * @returns {Promise<any>}
 */
async function getRegexes(token: any) {

    return new Promise((resolve, reject) => {

        const options = {
            uri: rootUrlRealDebrid + '/hosts/regex',
            qs: {
                auth_token: token.access_token
            },
            json: true
        };

        rp(options)
            .then(function (regexes: any) {
                resolve(regexes)
            })
            .catch((error: any) => {
                reject(error)
            })
    })
}

/**
 * Returns a list of all hosts from realdebrid API - used later to know if a supported host is up or down
 * @param token
 * @returns {Promise<void>}
 */
const getHostsStatus = async (token: any) => {
    try {
        const options = {
            uri: rootUrlRealDebrid + '/hosts/status',
            qs: {
                auth_token: token.access_token
            },
            json: true
        };

        return await rp(options);
    } catch(error) {
        throw error
    }

};

/**
 * Returns true/false
 * @param links
 * @param regexes
 * @returns {Promise<boolean>}
 */
const areLinksSupported = async (links: any, regexes: any) => {

    const supportedLinks = [];
    await pMap(links, async (link: any) => {
        regexes.forEach((regex: any) => {
            const regEx = new RegExp(regex.substring(1, regex.length - 1));
            if (regEx.test(link)) {
                supportedLinks.push(link)
            }
        })
    }, {concurrency: 10});

    return supportedLinks.length === links.length

};

/**
 * Returns all links which are supported by RealDebrid
 * @param qualityLinks
 * @param regexes
 * @param hostsStatus
 * @returns {Promise<any>}
 */
async function getSupportedLinks(qualityLinks: any, regexes: any, hostsStatus: any) {
    return new Promise((resolve, reject) => {

        const supportedLinks: any = {};

        for (const quality in qualityLinks)  {

            supportedLinks[quality] = [];

            qualityLinks[quality].forEach((link: any) => {
                regexes.forEach((regex: any) => {
                    const regEx = new RegExp(regex.substring(1, regex.length - 1));
                    if (regEx.test(link)) {

                        for (let hostNumber in Object.keys(hostsStatus)) {
                            if (link.match(Object.keys(hostsStatus)[hostNumber])) {
                                if (hostsStatus[Object.keys(hostsStatus)[hostNumber]].status === "up") {
                                    supportedLinks[quality].push(link)
                                }
                            }
                        }

                    }
                })
            })
        }

        resolve(supportedLinks)

    })
}

/**
 * Returns all links which are available - if no available link has been found -> return null
 * @param qualityLinks
 * @param token
 * @param hostsStatus
 * @returns {Promise<null>}
 */
async function getAvailableLinks(qualityLinks: any, token: any, hostsStatus: any) {

    let linksToReturn: any = {};

    let isThereAvailableLinks = false;

    for (let quality in qualityLinks) {

        const validLinks = await pFilter(qualityLinks[quality], async (link: any) => {

            if (link.split('\n').length > 1) {
                return await areValid(link.split('\n'), token, hostsStatus);
            } else {
                return await isValid(link, token, hostsStatus);
            }
        }, {concurrency: 10});

        // if there is at least 1 available link -> not return null
        if (validLinks.length > 0) {
            isThereAvailableLinks = true;
        }

        linksToReturn[quality] = validLinks;
    }


    if (isThereAvailableLinks) {
        return linksToReturn;
    } else {
        return null
    }
}

/**
 * Test the validity of an only one link - to use with "getAvailableLinks" function
 * @param link
 * @param token
 * @param hostStatus
 * @returns {Promise<boolean>}
 */
const isValid = async (link: any, token: any, hostStatus: any) => {

    const options = {
        method: 'POST',
        uri: "https://api.real-debrid.com/rest/1.0/unrestrict/check",
        formData: {
            link: link,
            auth_token: token.access_token
        },
        json: true
    };

    try {
        const response = await rp(options);

        if (response.hasOwnProperty('error')) {
            return false
        } else {
            if (response.supported === 1) {
                for (let hostNumber in Object.keys(hostStatus)) {
                    if (link.match(Object.keys(hostStatus)[hostNumber])) {
                        // return hostStatus[Object.keys(hostStatus)[hostNumber]].status === "up";
                        return hostStatus[Object.keys(hostStatus)[hostNumber]].supported === 1;
                    }
                }
                return false
            } else {
                return false
            }
        }
    } catch(error) {
        return false
    }
};

/**
 * Test the validity of an array of links
 * @param links
 * @param token
 * @param hostStatus
 * @returns {Promise<boolean>}
 */
async function areValid(links: any, token: any, hostStatus: any) {

    let areAllLinksValid = true;

    for (let link in links) {
        const isLinkValid = await isValid(links[link], token, hostStatus);

        if (!isLinkValid) {
            areAllLinksValid = false;
            break;
        }
    }
    return areAllLinksValid;
}

/**
 * Unrestricts an object <qualities{[links]}>
 * @param links
 * @param token
 * @returns {Promise<void>}
 */
async function unrestricLinks(links: any, token: any) {

    let unrestrictedLinks: any = {};

    for (let quality in links) {

        unrestrictedLinks[quality] = [];

        await pMap(links[quality], async (link: any) => {

            const unrestricetdLink = await unrestricLink(link, token);

            unrestrictedLinks[quality].push(unrestricetdLink)
        }, {concurrency: 10});
    }

    return unrestrictedLinks;
}

/**
 *
 * @param links
 * @param token
 * @returns {Promise<*>}
 */
const unrestrictArrayOfLinks = async (links: any, token: any) => {
    const unrestrictedLinks: any[] = [];

    await pMap(links, async (link: any) => {
        unrestrictedLinks.push(await unrestricLink(link, token))
    }, {concurrency: 10});

    return unrestrictedLinks;
};

/**
 * Unrestricts an only one link using RealDebrid
 * @param link
 * @param token
 * @returns {Promise<void>}
 */
async function unrestricLink(link: any, token: any) {
    const options = {
        method: 'POST',
        uri: "https://api.real-debrid.com/rest/1.0/unrestrict/link",
        headers: {
            Authorization: 'Bearer ' + token.access_token
        },
        formData: {
            link: link,
            remote: 1
        },
        json: true
    };

    return await rp(options);
}

/**
 * Unrestricts an only one link using RealDebrid WITHOUT db dependancy
 * @param link
 * @param user
 * @returns {Promise<void>}
 */
export async function unrestricLinkNoDB(link: any, user: any) {

    const token = await getRealdebridAuthToken(user);

    const options = {
        method: 'POST',
        uri: "https://api.real-debrid.com/rest/1.0/unrestrict/link",
        headers: {
            Authorization: 'Bearer ' + token.access_token
        },
        formData: {
            link: link,
            remote: 0
        },
        json: true
    };

    return await rp(options);
}

/**
 * Returns the lighter link from <qualities{[links]}>
 * @param links
 * @returns {Promise<void>}
 */
async function getLighterLink(links: any) {

    // Have to get the lighter link OF THE FIRST QUALITY WANTED !
    if (links.firstQualityLinks.length > 0) {
        return links.firstQualityLinks.find((link: any) => link.filesize === Math.min.apply(Math, links.firstQualityLinks.map((link: any) => link.filesize)));
    } else {
        if (links.secondQualityLinks.length > 0) {
            return links.secondQualityLinks.find((link: any) => link.filesize === Math.min.apply(Math, links.secondQualityLinks.map((link: any) => link.filesize)));
        } else {
            if (links.thirdQualityLinks.length > 0) {
                return links.thirdQualityLinks.find((link: any) => link.filesize === Math.min.apply(Math, links.thirdQualityLinks.map((link: any) => link.filesize)));
            } else {
                // TODO : test this case
                return null
            }
        }
    }

    // TODO: find a cleaner way of doing this !
    // TODO: handle if no episode is found
    // const lowerSizesToUse = [];
    //
    // for (let quality in links) {
    //
    //     // Getting the lower file size from all unrestricted links - and putting it in the array of lower sizes
    //     lowerSizesToUse.push(Math.min.apply(Math, links[quality].map(link => link.filesize)));
    //
    // }
    //
    // const lowerSize = Math.min.apply(Math, lowerSizesToUse);
    //
    // // Doing this to find the unrestricted link which has the lower file size (calculated above)
    // // Need to do this because of nature of object used : <qualities{[links]}>
    // for (let quality in links) {
    //
    //     const lighterLink = links[quality].find(link => link.filesize === lowerSize);
    //
    //     if (lighterLink !== undefined) {
    //         return lighterLink
    //     }
    // }

}

/**
 * Adds magnet link to realdebrid service - returns id of torrent
 * @param magnetLink
 * @param user
 * @param infos
 * @returns {Promise<void>}
 */
export const addMagnetLinkToRealdebrid = async (magnetLink: any, user: any, infos: any) => {

    try {

        const token = await getRealdebridAuthToken(user);

        const options = {
            method: 'POST',
            uri: rootUrlRealDebrid + '/torrents/addMagnet',
            headers: {
                'Authorization': 'Bearer ' + token.access_token
            },
            formData: {
                'host': 'real-debrid.com',
                'split': 2000,
                'magnet': magnetLink
            },
            json: true
        };

        const rdTorrentInfo = await rp(options);

        rdTorrentInfo.mediaInfos = infos;

        // Adding in db torrent's information to be able to create a directory (for the download) with a proper name
        // (not only using torrent name for that)
        await usersRef.child(user.uid).child(`/torrentsDownloaded/${rdTorrentInfo.id}`).set(rdTorrentInfo);

        return rdTorrentInfo;

    } catch(error) {
        await logger.info(error, user);
        throw error;
    }
};

/**
 * Select all files of a torrent added
 * @param torrentId
 * @param user
 * @returns {Promise<void>}
 */
export const selectAllTorrentFiles = async (torrentId: any, user: any) => {
    try {

        const token = await getRealdebridAuthToken(user);

        const options = {
            method: 'POST',
            uri: rootUrlRealDebrid + '/torrents/selectFiles/' + torrentId,
            headers: {
                'Authorization': 'Bearer ' + token.access_token
            },
            formData: {
                'files': 'all'
            },
            json: true
        };

        return await rp(options);


    } catch(error) {
        throw error;
    }
};

/**
 * Get all torrents present in realdebrid service
 * @returns {Promise<void>}
 */
export const getTorrents = async (user: any) => {
    try {

        const token = await getRealdebridAuthToken(user);

        const options = {
            method: 'GET',
            uri: rootUrlRealDebrid + '/torrents',
            headers: {
                'Authorization': 'Bearer ' + token.access_token
            },
            json: true
        };

        const torrents = await rp(options);

        // TODO: remove some useless "key: value" pairs of torrents object before returning
        return torrents;
    } catch(error) {
        // TODO: get a user to user logger here
        // logger.info(error);
        throw error;
    }
};

/**
 * Deletes a particular torrent in realdebrid service
 * @returns {Promise<void>}
 */
export const deleteTorrent = async (user: any, torrentId: any): Promise<any> => {
    try {

        const token = await getRealdebridAuthToken(user);

        const options = {
            method: 'DELETE',
            uri: rootUrlRealDebrid + '/torrents/delete/' + torrentId,
            headers: {
                'Authorization': 'Bearer ' + token.access_token
            },
            json: true
        };

        await rp(options);

        return null;
    } catch(error) {
        // TODO: get a user to user logger here
        // logger.info(error);
        throw error;
    }
};


module.exports.unrestricLinkNoDB = unrestricLinkNoDB;
module.exports.connectUser = connectUser;
module.exports.deleteTorrent = deleteTorrent;
module.exports.getTorrents = getTorrents;
module.exports.selectAllTorrentFiles = selectAllTorrentFiles;
module.exports.addMagnetLinkToRealdebrid = addMagnetLinkToRealdebrid;
module.exports.getBetterLink = getBetterLink;
module.exports.getUnrestrictedLinks = getUnrestrictedLinks;
