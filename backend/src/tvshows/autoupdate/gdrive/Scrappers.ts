const pMap = require('p-map');
const showsScrapers = require('../scrappers/main');
const ygg = require('../scrappers/torrent/ygg');
const logger = require('../../../logs/logger');
const database = require('../common/Database');

/**
 * Find new Tv Shows episodes
 * @param lastEpisodesFromStorage
 * @param user
 * @param qualities
 * @returns {Promise<*>}
 */
// @ts-ignore
export const downloadTorrentsToDebrider = async (lastEpisodesFromStorage: any, user: any, qualities: any) => {
    try {

        await pMap(lastEpisodesFromStorage, async (show: any) => {

            // Adding 1 to last episode know from FileStation API
            show.lastEpisode = (parseInt(show.lastEpisode) + 1).toString().padStart(2, '0');

            // TODO resolve an array of promises here to deal with multiple torrents providers
            const torrentPageUrl = await ygg.getLink(show, user, qualities);

            if (torrentPageUrl !== null) {
                await ygg.downloadTorrent(torrentPageUrl, user, show);
                await database.setNewEpisodeBadgeVisible(user, show);
            } else {

                await logger.info(`${show.name} S${show.lastSeason}E${show.lastEpisode} - no new episode found -> looking for next season`, user);

                // If no torrent url found previously -> looking for a new episode in a new season
                show.lastSeason = (parseInt(show.lastSeason) + 1).toString().padStart(2, '0');
                show.lastEpisode = '01';

                const torrentPageUrlNewSeason = await ygg.getLink(show, user, qualities);

                if (torrentPageUrlNewSeason !== null) {
                    await ygg.downloadTorrent(torrentPageUrlNewSeason, user, show);
                    await database.setNewEpisodeBadgeVisible(user, show);
                } else {
                    await logger.info(`${show.name} S${show.lastSeason}E${show.lastEpisode} - no new episode found`, user);
                }
            }

        }, {concurency: 10});

        return null
    } catch(error) {
        throw error
    }

};
module.exports.downloadTorrentsToDebrider = downloadTorrentsToDebrider;

