const cheerio = require('cheerio');
const rp  = require('request-promise');
const logger = require('../../../logs/logger');
const Torrent9RootUrl = 'https://www.torrent9.ch';
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
            uri: torrent9RealUrl + '/recherche/' + title,
            json: true,
            formData: {
                "torrentSearch" : title
            },
            followAllRedirects: true
        };

        const response = await rp(options);
        const $ = cheerio.load(response);

        const items = $('.table-responsive > .table > tbody > tr');

        const torrentsList = [];

        items.map((i, result)  => {

            torrentsList.push({
                provider: 'torrent9',
                title: result.children[1].children[2].attribs.title.replace('Télécharger ', '').replace(' en Torrent', ''),
                url: result.children[1].children[2].attribs.href,
                size: result.children[3].children[0].data,
                seed: result.children[5].children[0].children[0].data,
                leech: result.children[7].children[0].data
            })

            // const element = cheerio.load(result);
            //
            // // Return elements which are only movies
            // if (element('i')[0].attribs.class === 'fa fa-video-camera') {
            //     torrentsList.push({
            //         title: element('a')[0].attribs.title.replace('Télécharger ', '').replace(' en Torrent', ''),
            //         url: torrent9RealUrl + element('a')[0].attribs.href,
            //         size: element('td')[1].children[0].data,
            //         seed: element('td')[2].children[0].children[0].data,
            //         leech: element('td')[3].children[0].data
            //     })
            // }

        });

        return {
            provider: 'torrent9',
            torrents: torrentsList
        };

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

        const torrent9RealBaseUrl = await getRealUrl();

        const options = {
            method: 'GET',
            uri: torrent9RealBaseUrl + url,
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
