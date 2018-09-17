const cheerio = require('cheerio');
const rp  = require('request-promise');
const logger = require('../../../logs/logger');
const Torrent9RootUrl = 'https://ww2.torrent9.blue';
const realdebrid = require('../../../realdebrid/debrid_links');

/**
 * Returns the real URL used by the website - anytime
 * @param Torrent9Url
 * @returns {Promise<void>}
 */
const getRealUrl = async () => {
    const options = {
        method: 'GET',
        uri: Torrent9RootUrl,
        followRedirect: false
    };

    let urlToReturn = Torrent9RootUrl;

    try {
        const response = await rp(options);
        console.log(response)
    } catch(error) {
        urlToReturn = error.response.headers.location
    }

    return urlToReturn.replace(/\/$/, '');
};

/**
 * Returns a list of Torrent9 torrents for a particular title
 * @param title
 * @returns {Promise<Array>}
 */
const getTorrentsList = async title => {

    const torrent9RealUrl = await getRealUrl();

    try {
        const options = {
            method: 'POST',
            uri: torrent9RealUrl + '/search_torrent/',
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
                    url: torrent9RealUrl + element('a')[0].attribs.href,
                    size: element('td')[1].children[0].data,
                    seed: element('td')[2].children[0].children[0].data,
                    leech: element('td')[3].children[0].data
                })
            }

        });

        return torrentsList;

    } catch(error) {
        throw error;
    }
};

/**
 * Start the download of a torrent file
 * @param url
 * @param user
 * @returns {Promise<null>}
 */
const downloadTorrentFile = async (url, user) => {

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
        const rdTorrentInfo = await realdebrid.addMagnetLinkToRealdebrid(magnetLink, user);
        await realdebrid.selectAllTorrentFiles(rdTorrentInfo.id, user);

        return null;

    } catch(error) {
        throw error;
    }
};

module.exports.getTorrentsList = getTorrentsList;
module.exports.downloadTorrentFile = downloadTorrentFile;
