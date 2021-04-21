const rapidmoviez = require('./ddl/rapidmoviez');
const zonetelechargement = require('./ddl/zonetelechargement');
const ygg = require('./torrent/ygg');
const pMap = require('p-map');
const logger = require('../../../logs/logger');

/**
 * Returns an only one link
 * @param show
 * @param user
 * @param qualities
 * @returns {Promise<*>}
 */
const getLink = async (show, user, qualities) => {

    try {

        const providersPromises = [
            // rapidmoviez.getLink(show, user, qualities),
            // zonetelechargement.getLink(show, user, qualities),
            // Not using DDL anymore and only torrent (see if it's a good idea)
            ygg.getLink(show, user, qualities)
        ];

        const links = await pMap(providersPromises, link => {
            return link
        }, {concurency: 1});

        return downloadBetterTorrent(links);

    } catch(error) {
        // TODO: get a user to user logger here
        // logger.info(error);
        // throw error;
        if (error.error.message) {
            throw new Error(error.error.message);
        } else {
            throw new Error('Unable to find links for the show - ' + show.title);
        }
    }
};

/**
 * Returns the ligher link (from array of links)
 * @param links
 * @returns {*}
 */
const downloadBetterTorrent = (links) => {

    links = links.filter(link => link !== null);
    links = links.filter(link => link !== undefined);



    // if (links.length > 0) {
    //     return links.find(link => link.filesize === Math.min.apply(Math, links.map(link => link.filesize)));
    // } else {
    //     return null
    // }
};

module.exports.getLink = getLink;