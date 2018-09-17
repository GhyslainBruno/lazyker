const rapidmoviez = require('./rapidmoviez');
const zonetelechargement = require('./zonetelechargement');
const pMap = require('p-map');
const logger = require('../../logs/logger');

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
            rapidmoviez.getLink(show, user, qualities),
            zonetelechargement.getLink(show, user, qualities)
        ];

        const links = await pMap(providersPromises, link => {
            return link
        }, {concurency: 1});

        return getLighterLink(links);

    } catch(error) {
        logger.info(error);
        throw error;
    }
};

/**
 * Returns the ligher link (from array of links)
 * @param links
 * @returns {*}
 */
const getLighterLink = (links) => {

    links = links.filter(link => link !== null);
    links = links.filter(link => link !== undefined);

    if (links.length > 0) {
        return links.find(link => link.filesize === Math.min.apply(Math, links.map(link => link.filesize)));
    } else {
        return null
    }
};

module.exports.getLink = getLink;