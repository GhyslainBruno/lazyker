const got = require('got');
const cheerio = require('cheerio');
const rootUrl = 'https://vww.gktorrent.pw/'

const getTorrentsList = async title => {

    const searchPage = await got(rootUrl+ '/recherche/' + title);
    const $ = cheerio.load(searchPage.body);
    let torrentsList = [];


    try {
        if ($('tbody > tr > td > center').length === 1) {
            torrentsList = [];
        } else {
            torrentsList = $('tbody > tr').toArray().map(row => {
                return {
                    url: row.children.filter(child => child.name === 'td')[0].children[2].attribs.href,
                    title: row.children.filter(child => child.name === 'td')[0].children[2].attribs.title,
                    size: row.children.filter(child => child.name === 'td')[1].children[0].data,
                    seed: row.children.filter(child => child.name === 'td')[2].children[0].data,
                    leech: row.children.filter(child => child.name === 'td')[3].children[0].data
                }
            })
        }
    } catch(error) {
        throw new Error('Something bad happened while searching for torrents with GKTorrent scraper');
    }

    return {
        provider: 'gktorrent',
        torrents: torrentsList
    };
};

module.exports.getTorrentsList = getTorrentsList;
