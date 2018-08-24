const cheerio = require('cheerio');
const rp  = require('request-promise');
const logger = require('../../../logs/logger');
const Torrent9RootUrl = 'https://ww2.torrent9.blue';
const realdebrid = require('../../../realdebrid/debrid_links');

/**
 * Returns a list of Torrent9 torrents for a particular title
 * @param title
 * @returns {Promise<Array>}
 */
const getTorrentsList = async title => {
    try {
        const options = {
            method: 'POST',
            uri: Torrent9RootUrl + '/search_torrent/',
            json: true,
            formData: {
                "champ_recherche" : title
            },
            followAllRedirects: true
        };

        const response = await rp(options);
        const $ = cheerio.load(response);

        const items = $('tr');

        const torrentsList = [];

        items.map((i, result)  => {

            const element = cheerio.load(result);

            // Return elements which are only movies
            if (element('i')[0].attribs.class === 'fa fa-video-camera') {
                torrentsList.push({
                    title: element('a')[0].attribs.title.replace('Télécharger ', '').replace(' en Torrent', ''),
                    url: Torrent9RootUrl + element('a')[0].attribs.href,
                    size: element('td')[1].children[0].data,
                    seed: element('td')[2].children[0].children[0].data,
                    leech: element('td')[3].children[0].data
                })
            }

        });

        return torrentsList;

    } catch(error) {
        logger.info(error);
        throw error;
    }
};

/**
 * Start the download of a torrent file
 * @param title
 * @returns {Promise<void>}
 */
const downloadTorrentFile = async url => {

    try {

        const options = {
            method: 'GET',
            uri: url,
            json: true,
            followAllRedirects: true
        };

        const response = await rp(options);
        const $ = cheerio.load(response);

        const magnetLink = $('a.btn.btn-danger.download')[1].attribs.href;

        // Adding torrent to realdebrid service
        const rdTorrentInfo = await realdebrid.addMagnetLinkToRealdebrid(magnetLink);
        await realdebrid.selectAllTorrentFiles(rdTorrentInfo.id);

        return null;

    } catch(error) {
        logger.info(error);
        throw error;
    }
};

module.exports.getTorrentsList = getTorrentsList;
module.exports.downloadTorrentFile = downloadTorrentFile;
