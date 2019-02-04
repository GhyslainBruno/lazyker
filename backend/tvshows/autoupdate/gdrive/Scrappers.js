const pMap = require('p-map');
const showsScrapers = require('../scrappers/main');
const ygg = require('../scrappers/torrent/ygg');
const logger = require('../../../logs/logger');

/**
 * Find new Tv Shows episodes
 * @param lastEpisodesFromStorage
 * @param user
 * @param qualities
 * @returns {Promise<*>}
 */
const downloadTorrentsToDebrider = async (lastEpisodesFromStorage, user, qualities) => {
    try {

        await pMap(lastEpisodesFromStorage, async show => {

            // Adding 1 to last episode know from FileStation API
            show.lastEpisode = (parseInt(show.lastEpisode) + 1).toString().padStart(2, '0');

            // TODO resolve an array of promises here to deal with multiple torrents providers
            const torrentPageUrl = await ygg.getLink(show, user, qualities);

            if (torrentPageUrl !== null) {
                await ygg.downloadTorrent(torrentPageUrl, user, show);
            } else {

                // If no torrent url found previously -> looking for a new episode in a new season
                show.lastSeason = (parseInt(show.lastSeason) + 1).toString().padStart(2, '0');
                show.lastEpisode = '01';

                const torrentPageUrlNewSeason = await ygg.getLink(show, user, qualities);

                if (torrentPageUrlNewSeason !== null) {
                    await ygg.downloadTorrent(torrentPageUrl, user, show);
                } else {
                    console.log('no new episode found');
                }
            }

        }, {concurency: 10});

        return null
    } catch(error) {
        throw error
    }

};
module.exports.downloadTorrentsToDebrider = downloadTorrentsToDebrider;

