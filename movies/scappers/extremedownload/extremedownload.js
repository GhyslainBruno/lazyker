const rp  = require('request-promise');
const cheerio = require('cheerio');
const edprotect = require('./edprotect');

const EDRootUrl = 'https://www.extreme-d0wn.com/index.php';

const providerName = 'extremedownload';

const getUrls = async function getUrls(title) {

    const options = {
        method: 'POST',
        uri: EDRootUrl,
        formData: {
            do: 'search',
            subaction: 'search',
            story: title
        },
        json: true
    };

    try {

        const response = await rp(options);

        const $ = cheerio.load(response);

        const results = $('a.top-last.thumbnails');

        const resultsToReturn = [];

        results.map((i, result) => {

            const element = cheerio.load(result);

            resultsToReturn.push({
                image: element('img.img-post')[0].attribs.src,
                url: result.attribs.href,
                title: element('.top-title')[0].children[0].data,
                quality: element('.top-lasttitle')[0].children[0].data
            })
        });

        return {title: title, provider: providerName, results: resultsToReturn};

    } catch(error) {
        throw error
    }
}

const getMovieQualities = async function getMovieQualities(title) {

    const urlsWithQualities = await getUrls(title);

    const qualitiesToReturn = [];

    urlsWithQualities.results.map( element => {
        qualitiesToReturn.push({
            quality: element.quality,
            lang: '',
            url: element.url,
            provider: providerName
        });
    });

    return {
        title: title,
        qualities: qualitiesToReturn
    }
};

const getDownloadLinks = async function getDownloadLinks(url) {

    const options = {
        method: 'GET',
        uri: url,
        json: true
    };

    try {

        let linksToReturn = {
            free: [],
            premium: []
        };

        const response = await rp(options);
        const $ = cheerio.load(response);

        const rawLinks = $('.prez_2')[0].next.next.next.next.children;

        rawLinks.map(rawLink => {

            if (rawLink.children !== undefined) {
                if (rawLink.children.length > 0) {
                    const hostName = rawLink.children[0].children[0].data;

                    // If the link is a premium link
                    if (hostName.match(/[Pp][Rr][Ee][Mm][Ii][Uu][Mm]/g)) {
                        linksToReturn.premium.push({
                            host_name: hostName,
                            links: rawLink.attribs.href
                        })
                    } else {
                        linksToReturn.free.push({
                            host_name: hostName,
                            links: rawLink.attribs.href
                        })
                    }
                }
            }



        });

        return linksToReturn

    } catch(error) {
        return error
    }
};


module.exports.getMovieQualities = getMovieQualities;

module.exports.getUrls = getUrls;

module.exports.getDownloadLinks = getDownloadLinks;