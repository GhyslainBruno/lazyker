const rp  = require('request-promise');
const cheerio = require('cheerio');
const dlprotect = require('./dlprotect1com');
const logger = require('../../logs/logger');


const ZTRootUrl = 'https://www.zone-telechargement1.org/';

const providerName = 'zonetelechargement';

/**
 * Returns the real URL used by the website - anytime
 * @param ZTRootUrl
 * @returns {Promise<void>}
 */
const getRealUrl = async () => {
    const options = {
        method: 'POST',
        "rejectUnauthorized": false,
        uri: ZTRootUrl + 'index.php?do=search',
        formData: {
            do: 'search',
            subaction: 'search',
            story: 'foo',
            search_start: 0,
            full_search: 1,
            result_from: 1,
            titleonly: 3,
            searchuser: '',
            replyless: '',
            replylimit: '',
            searchdate: '' ,
            beforeafter: 'after',
            sortby: 'date',
            resorder: 'desc',
            showposts: 0,
            'catlist[]': 2,
        }
    };

    let urlToReturn = ZTRootUrl;

    try {
        const response = await rp(options);
        console.log(response)
    } catch(error) {
        if (error.response === undefined) {
            throw error
        } else {
            urlToReturn = error.response.headers.location
        }
    }

    return urlToReturn
};

/**
 * Return available qualities for a particular movie using this provider
 * @param moviePath
 * @param title
 * @returns {Promise<{title: *, qualities: Array}>}
 */
const getMovieQualities = async function getMovieQualities(moviePath, title) {

    const qualitiesToReturn = [];

    const options = {
        method: 'GET',
        "rejectUnauthorized": false,
        uri: moviePath,
        json: true
    };

    const response = await rp(options);
    const $ = cheerio.load(response);

    const otherQualities = $('.otherversions > a');

    if (otherQualities.length > 0) {
        // Getting only the other qualities (ZT "header")
        otherQualities.map(function(i, el) {

            qualitiesToReturn.push({
                quality: el.children[0].children[0].children[0].children[0].data,
                lang: el.children[0].children[1].children[0].children[0].data,
                url: el.attribs.href,
                provider: providerName
            });

        });
    }


    // Adding the current quality to the array returned
    const qualityLangString = $('.smallsep').next().next()[0].children[0].data.split('|');

    qualitiesToReturn.push({
        quality: qualityLangString[0],
        lang: qualityLangString[1],
        url: moviePath.substr(moviePath.lastIndexOf('/'), moviePath.length),
        provider: providerName
    });

    return {
        title: title,
        qualities: qualitiesToReturn
    }
};

/**
 * Returns all search results
 * @param title
 * @returns {Promise<{title: *, provider: string, results: Array}>}
 */
const getUrls = async function getUrls(title) {

    const ZTRealUrl = await getRealUrl();

    const options = {
        method: 'POST',
        uri: ZTRealUrl,
        "rejectUnauthorized": false,
        formData: {
            do: 'search',
            subaction: 'search',
            story: title,
            search_start: 0,
            full_search: 1,
            result_from: 1,
            titleonly: 3,
            searchuser: '',
            replyless: '',
            replylimit: '',
            searchdate: '' ,
            beforeafter: 'after',
            sortby: 'date',
            resorder: 'desc',
            showposts: 0,
            'catlist[]': 2,
        },
        followAllRedirects: false,
        json: true
    };

    try {

        // const response = await cf.request(options);

        const response = await rp(options);

        const $ = cheerio.load(response);

        const results = $('.cover_global');

        const resultsToReturn = [];

        results.map((i, result) => {

            const element = cheerio.load(result);

            resultsToReturn.push({
                image: element('div > a > img')[0].attribs.src,
                url: element('.cover_infos_global > .cover_infos_title > a')[0].attribs.href,
                title: element('.cover_infos_global > .cover_infos_title > a')[0].children[0].data
            })
        });

        return {title: title, provider: providerName, results: resultsToReturn};

    } catch(error) {
        throw error;
    }
};

/**
 * Return object{
 *     premium: {
 *         host_name: "hostName",
 *         links: [links]
 *     },
 *     free: {
 *         host_name: "hostName",
 *         links: [links]
 *     }
 * }
 * @param url
 * @returns {Promise<*>}
 */
const getDownloadLinks = async function getDownloadLinks(url) {

    const ZTRealUrl = await getRealUrl();

    const options = {
        method: 'GET',
        "rejectUnauthorized": false,
        uri: ZTRealUrl.replace('/index.php?do=search', '') + url,
        json: true
    };

    try {

        // See if usefull later
        let host = {
            name: '',
            links: []
        };

        let linksToReturn = {
            free: [],
            premium: []
        };

        const response = await rp(options);
        const $ = cheerio.load(response);

        let isInPremiumPart = false;

        // downloadItem --> every item in the download part (links, host names, 'premium' or not strings...)
        const downloadItems = $('.postinfo')[0].children.filter(result => result.name !== "br");

        let currentHostName = '';

        downloadItems.map((item, i) => {

            // Add in NOT premium part
            if (!isInPremiumPart) {

                // Check if in premium part
                if (item.children[0].data) {
                    if (item.children[0].data.match(/[Pp][Rr][Ee][Mm][Ii][Uu][Mm]/g) !== null) {
                        isInPremiumPart = true;
                    }
                }

                // find the host name
                if (item.children[0].children !== undefined && item.children.length === 1 && item.children[0].attribs.href === undefined) {
                    currentHostName = item.children[0].children[0].data;
                }

                // Add links to return object
                if (item.children.filter(child => child.name === 'a').length > 0) {
                    linksToReturn.free.push({
                        host_name: currentHostName,
                        links: item.children.filter(child => child.name === 'a').map(child => child.attribs.href)
                    });
                }

            } else {
                // Add in PREMIUM part

                // find the host name
                if (item.children[0].children !== undefined && item.children.length === 1 && item.children[0].attribs.href === undefined) {
                    currentHostName = item.children[0].children[0].data;
                }

                // Add links to return object
                if (item.children.filter(child => child.name === 'a').length > 0) {
                    linksToReturn.premium.push({
                        host_name: currentHostName,
                        links: item.children.filter(child => child.name === 'a').map(child => child.attribs.href)
                    });
                }
            }
        });

        return linksToReturn

    } catch(error) {
        return error
    }
};

// Second bloc - use quality selected (just url is needed)
// to check availability and, if so, start download

module.exports.getMovieQualities = getMovieQualities;
module.exports.getUrls = getUrls;
module.exports.getDownloadLinks = getDownloadLinks;