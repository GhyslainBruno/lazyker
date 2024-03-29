const pMap = require('p-map');
const showsScrapers = require('../scrappers/main');
const logger = require('../../../logs/logger');

/**
 * Find new Tv Shows episodes
 * @param lastEpisodesFromStorage
 * @param user
 * @param qualities
 * @returns {Promise<*>}
 */
export const findNewEpisodes = async (lastEpisodesFromStorage: any, user: any, qualities: any) => {
    try {
        let lastEpisodes = lastEpisodesFromStorage;
        await pMap(lastEpisodes, async (link: any) => {

            // Adding 1 to last episode know from FileStation API
            link.lastEpisode = (parseInt(link.lastEpisode) + 1).toString().padStart(2, '0');

            let betterLink = await showsScrapers.getLink(link, user, qualities);

            // Better to check if the episode wanted is found or not
            // Here, if episode + 1 of the same season is not found, we are looking for episode 01 of season : seasonNumber + 1 --> TODO: still need to be tested with firebase
            if (betterLink === null) {

                const lastEpisodeObjectToUseHere = lastEpisodes.find((show: any) => show.name === link.name);

                lastEpisodeObjectToUseHere.lastSeason = (parseInt(link.lastSeason) + 1).toString().padStart(2, '0');
                lastEpisodeObjectToUseHere.lastEpisode = '01';

                betterLink = await showsScrapers.getLink(lastEpisodeObjectToUseHere, user, qualities);

                if (betterLink === null) {
                    // await logger.info('No new episode found for ' + lastEpisodeObjectToUseHere.name, user);
                }

                lastEpisodes.find((show: any) => show.name === link.name).unrestrictedLink = betterLink;

            } else {
                lastEpisodes.find((show: any) => show.name === link.name).unrestrictedLink = betterLink;
            }

        }, {concurency: 10});

        return lastEpisodes
    } catch(error) {
        throw error
    }

};

module.exports.findNewEpisodes = findNewEpisodes;
