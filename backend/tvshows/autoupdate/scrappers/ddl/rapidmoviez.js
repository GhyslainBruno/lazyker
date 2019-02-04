const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');
const _ = require('lodash');

const logger = require('../../../../logs/logger');
const realdebrid = require('../../../../realdebrid/debrid_links');

const rootRMZ = "http://rmz.cr/";

// TODO: fill "returns" documentation

const getLink = async function getLink(show, user, qualities) {
    try {

        const path = await getTvShowPath(show.name);

        const rmzLinks = await getRMZLinks(path, show.lastSeason, show.lastEpisode);

        // const qualities = await getQualities(database);

        const rmzLinksSortedWithQualities = await getRMZLinksWithQualityWanted(qualities, rmzLinks);

        const hostsLinks = await getHostsLinks(rmzLinksSortedWithQualities);

        // Calling the RealDebrid module
        return await realdebrid.getBetterLink(hostsLinks, user);


    } catch(error) {
        // TODO: get a user to user logger here
        // logger.info(error)
        throw error
    }
};

/**
 * Returns
 * @param title
 * @returns {Promise<any>}
 */
async function getTvShowPath(title) {

    // TODO: set in db show path and check it, to not do it all the time

    const url = rootRMZ + 'search/' + title;

    //Cheerio use
    return new Promise((resolve, reject) => {

        cloudscrapperPost(url, {})
            .then(body => {

                // This code is coming from shows-node project --> TODO: write it better
                // console.time('cheerio load');
                // global.gc();
                const $ = cheerio.load(body);
                // console.timeEnd('cheerio load');
                const $tmp= $('.list_items > ul > li')[0];

                if ($tmp !== undefined) {
                    const tvShowPagePath = $tmp.children[3].attribs.href;
                    resolve(tvShowPagePath)
                } else if ($('.blogs strong').html() === "Warning: High Server Load") {
                    reject("Warning - RMZ - High server load")
                } else {
                    reject("ERROR: Issue bypassing cloudflare");
                }
            })
            .catch(error => {
                reject(error)
            })
    })


    // Puppeteer use
    //
    // const browser = await puppeteer.launch({
    //     headless: false
    // });
    // const page = await browser.newPage();
    // await page.goto(url, {waitUntil: 'networkidle2'});
    // await page.pdf({path: 'screenshot.pdf', format: 'A4'});
    //
    // await browser.close();
}

/**
 * Returns
 * @param showPath
 * @param seasonNumber
 * @param episodeNumber
 * @returns {Promise<any>}
 */
async function getRMZLinks(showPath, seasonNumber, episodeNumber) {
    const url = rootRMZ + showPath;

    return new Promise((resolve, reject) => {
        cloudScrapperGet(url)
            .then(body => {

                // Code coming from "shows-node" project
                const $ = cheerio.load(body);

                const allEpisodesLinks = $('#episodes > li > span.watch').map(function() {
                    return {
                        title: $(this).attr('title'),
                        path: $(this).attr('href')
                    }
                });

                const regex = new RegExp(".*[Ss](" + seasonNumber + ")[Ee](" + episodeNumber + ").*");

                const episodesWantedLinks = _.filter(allEpisodesLinks, episode => regex.test(episode.title));
                //

                resolve(episodesWantedLinks)

            })
            .catch(error => {
                reject(error)
            })
    })
}

/**
 * Returns
 * @param db
 * @returns {Promise<any>}
 */
async function getQualities(database) {

    // Firestore way
    // return new Promise(function(resolve, reject) {
    //     db.collection('configuration').doc("qualities").get()
    //         .then( snapshot => {

    //             const qualities = {};

    //             // Not returning quality if setting to "none"
    //             for (let item in snapshot.data()) {
    //                 if (snapshot.data()[item] !== "none") {
    //                     qualities[item] = snapshot.data()[item]
    //                 }
    //             }

    //             resolve(qualities)
    //         })
    //         .catch( err => {
    //             reject(err)
    //         })

    // })

    // node-json-db way
    // const qualitiesFromDb = db.getData('/configuration/qualities')
    //
    // return Object.keys(qualitiesFromDb)
    //     .filter(key => qualitiesFromDb[key] !== "none")
    //     .reduce((obj, key) => {
    //         obj[key] = qualitiesFromDb[key];
    //         return obj;
    //     }, {});


    // Firebase way

}


/**
 * Returns
 * @param qualities
 * @param links
 * @returns {Promise<any>}
 */
async function getRMZLinksWithQualityWanted(qualities, links) {

    return new Promise((resolve, reject) => {

        let linksToUse = [];

        let linksWithQualityWanted = {};


        if (qualities.h265) {
            linksToUse =_.filter(links, link => (_.includes(link.title, "HEVC") || _.includes(link.title, "x265")))
        } else {
            linksToUse =_.filter(links, link => !(_.includes(link.title, "HEVC") || _.includes(link.title, "x265")))
        }

        if (qualities.hasOwnProperty('first')) {
            const firstQualityLinks = [];
            Array.prototype.push.apply(firstQualityLinks, _.filter(linksToUse, link => _.includes(link.title, qualities.first)))
            linksWithQualityWanted.firstQualityLinks = firstQualityLinks
        }

        if (qualities.hasOwnProperty('second')) {
            const secondQualityLinks = [];
            Array.prototype.push.apply(secondQualityLinks, _.filter(linksToUse, link => _.includes(link.title, qualities.second)))
            linksWithQualityWanted.secondQualityLinks = secondQualityLinks
        }

        if (qualities.hasOwnProperty('third')) {
            const thirdQualityLinks = [];
            Array.prototype.push.apply(thirdQualityLinks, _.filter(linksToUse, link => _.includes(link.title, qualities.third)))
            linksWithQualityWanted.thirdQualityLinks = thirdQualityLinks
        }

        // To check if no link was found
        if (Object.keys(linksWithQualityWanted).length === 0) {
            reject('No link found')
        } else {
            resolve(linksWithQualityWanted)
        }

    })

}


/**
 * Returns
 * @param linksWithQuality
 * @returns {Promise<any>}
 */
async function getHostsLinks(linksWithQuality) {
    return new Promise((resolve, reject) => {

        // TODO: handle if multiple links are found for one episode --> is handled that way (for now, maybe find a better way) : link1\nlink2\nlink3
        const hostsLinks = {};

        const promisesQualities = [];

        for (let quality in linksWithQuality) {

            hostsLinks[quality] = [];

            let currentPromise = new Promise((resolve, reject) => {

                const promisesLinks = [];

                // Is quality an array ?
                linksWithQuality[quality].forEach(link => {
                    let currentLinkPromise = new Promise((resolve, reject) => {

                        cloudScrapperGet(rootRMZ + link.path)
                            .then(body => {

                                const $ = cheerio.load(body);
                                $(".links").filter(function(){return this.name.match(/pre/)}).each(function() {
                                    hostsLinks[quality].push($(this)[0].children[0].data);
                                });

                                resolve()

                            })
                            .catch(error => {
                                reject(error)
                            })

                    });

                    promisesLinks.push(currentLinkPromise)
                });

                Promise.all(promisesLinks)
                    .then(results => {
                        resolve(results)
                    })
                    .catch(error => {
                        reject(error)
                    })

            });

            promisesQualities.push(currentPromise)

        }

        Promise.all(promisesQualities)
            .then(result => {
                resolve(hostsLinks)
            })
            .catch(error => {
                reject(error)
            })

    })
}


//// Convenient methods to bypasse cloudflare using cloudscaper package ////
/**
 *
 * @param url
 * @returns {Promise<any>}
 */
function cloudScrapperGet(url) {
    return new Promise((resolve, reject) => {
        cloudscraper.get(url, function(error, response, html) {
            if (!error) {
                resolve(html)
            } else {
                reject(error)
            }
        })
    })
}

/**
 *
 * @param url
 * @param data
 * @returns {Promise<any>}
 */
function cloudscrapperPost(url, data) {
    return new Promise((resolve, reject) => {
        cloudscraper.post(url, data, function(error, response, body) {
            if (!error) {
                resolve(body)
            } else {
                reject(error)
            }
        })
    })
}
////


/**
 * Exported methods
 * @type {getLinks}
 */
module.exports.getLink = getLink;