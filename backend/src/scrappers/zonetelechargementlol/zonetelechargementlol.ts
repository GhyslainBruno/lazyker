// const rp  = require('request-promise');
// const cheerio = require('cheerio');
// const dlprotect = require('./dlprotect1co');
// // const puppeteer = require('puppeteer');
// const logger = require('../../logs/logger');
//
// const cloudscraper = require('cloudscraper');
// // const CloudflareBypasser = require('cloudflare-bypasser');
//
// // let cf = new CloudflareBypasser();
//
// const ZTRootUrl = 'https://www.zone-telechargement.lol/';
//
// const providerName = 'zonetelechargementlol';
//
//
// // First bloc of usefull functions - display qualities of movie to user
// const getMovieQualities = async function getMovieQualities(moviePath, title) {
//
//     const qualitiesToReturn = [];
//
//     const options = {
//         method: 'GET',
//         uri: moviePath,
//         json: true
//     };
//
//     const response = await cf.request(options);
//     const $ = cheerio.load(response);
//
//     const otherQualities = $('.otherversions > a');
//
//     if (otherQualities.length > 0) {
//         // Getting only the other qualities (ZT "header")
//         otherQualities.map(function(i, el) {
//
//             qualitiesToReturn.push({
//                 quality: el.children[0].children[0].children[0].children[0].data,
//                 lang: el.children[0].children[1].children[0].children[0].data,
//                 url: el.attribs.href,
//                 provider: providerName
//             });
//
//         });
//     }
//
//
//     // Adding the current quality to the array returned
//     const qualityLangString = $('.smallsep').next().next()[0].children[0].data.split('|');
//
//     qualitiesToReturn.push({
//         quality: qualityLangString[0],
//         lang: qualityLangString[1],
//         url: moviePath.substr(moviePath.lastIndexOf('/'), moviePath.length),
//         provider: providerName
//     });
//
//     return {
//         title: title,
//         qualities: qualitiesToReturn
//     }
// };
//
// /**
//  * Returns all search results
//  * @param title
//  * @returns {Promise<{title: *, provider: string, results: Array}>}
//  */
// const getUrls = async function getUrls(title) {
//
//     // Using pupeteer
//     const browser = await puppeteer.launch({headless: false, timeout: 60000});
//     try {
//         const page = await browser.newPage();
//
//         await page.goto(ZTRootUrl, {timeout: 60000});
//
//         // Waiting to bypass cloudflare
//         await page.waitFor(10000);
//
//         await page.waitForSelector("body");
//
//         await page.click("button.navbar-toggler");
//
//         await page.type('input[name=story]', title);
//
//         await page.keyboard.down('Enter');
//
//         await page.waitForSelector("body");
//
//         await page.waitFor(1000);
//
//         const html = await page.evaluate(body => body.innerHTML, await page.$('body'));
//
//         browser.close();
//
//         const $ = cheerio.load(html);
//
//         const results = $('.mov');
//
//         const resultsToReturn = [];
//
//         results.map((i, result) => {
//             const element = cheerio.load(result);
//             resultsToReturn.push({
//                 image: ZTRootUrl + element('img')[0].attribs.src,
//                 url: element('.mov-t')[0].attribs.href,
//                 title: element('.mov-t')[0].attribs.title
//             })
//         });
//
//         return {title: title, provider: providerName, results: resultsToReturn};
//
//     } catch(error) {
//         // TODO: get a user to user logger here
//         // logger.info(error);
//         browser.close();
//         throw error;
//     }
//
//
//
//
//
//     // Using cheerio
//     // const options = {
//     //     method: 'POST',
//     //     url: ZTRootUrl,
//     //     formData: {
//     //         do: 'search',
//     //         subaction: 'search',
//     //         story: title,
//     //         user_hash: 'eb98083a84ed28aa143abdf7995a5953ab19b38d'
//     //     },
//     //     followAllRedirects: false,
//     //     json: true
//     // };
//     //
//     // try {
//     //
//     //     // const response = await cf.request(options);
//     //
//     //     const response = await cloudScrapperRequest(options);
//     //
//     //     const $ = cheerio.load(response);
//     //
//     //     const results = $('.cover_global');
//     //
//     //     const resultsToReturn = [];
//     //
//     //     results.map((i, result) => {
//     //
//     //         const element = cheerio.load(result);
//     //
//     //         resultsToReturn.push({
//     //             image: element('div > a > img')[0].attribs.src,
//     //             url: element('.cover_infos_global > .cover_infos_title > a')[0].attribs.href,
//     //             title: element('.cover_infos_global > .cover_infos_title > a')[0].children[0].data
//     //         })
//     //     });
//     //
//     //     return {title: title, provider: providerName, results: resultsToReturn};
//     //
//     // } catch(error) {
//     //     throw error
//     // }
// };
//
// const getDownloadLinks = async function getDownloadLinks(url) {
//
//     const options = {
//         method: 'GET',
//         uri: ZTRootUrl + url,
//         json: true
//     };
//
//     try {
//
//         // See if usefull later
//         let host = {
//             name: '',
//             links: []
//         };
//
//         let linksToReturn = {
//             free: [],
//             premium: []
//         };
//
//         const response = await cf.request(options);
//         const $ = cheerio.load(response);
//
//         let isInPremiumPart = false;
//
//         // downloadItem --> every item in the download part (links, host names, 'premium' or not strings...)
//         const downloadItems = $('.postinfo')[0].children.filter(result => result.name !== "br");
//
//         let currentHostName = '';
//
//         downloadItems.map((item, i) => {
//
//             // Add in NOT premium part
//             if (!isInPremiumPart) {
//
//                 // Check if in premium part
//                 if (item.children[0].data) {
//                     if (item.children[0].data.match(/[Pp][Rr][Ee][Mm][Ii][Uu][Mm]/g) !== null) {
//                         isInPremiumPart = true;
//                     }
//                 }
//
//                 // find the host name
//                 if (item.children[0].children !== undefined && item.children.length === 1 && item.children[0].attribs.href === undefined) {
//                     currentHostName = item.children[0].children[0].data;
//                 }
//
//                 // Add links to return object
//                 if (item.children.filter(child => child.name === 'a').length > 0) {
//                     linksToReturn.free.push({
//                         host_name: currentHostName,
//                         links: item.children.filter(child => child.name === 'a').map(child => child.attribs.href)
//                     });
//                 }
//
//             } else {
//             // Add in PREMIUM part
//
//                 // find the host name
//                 if (item.children[0].children !== undefined && item.children.length === 1 && item.children[0].attribs.href === undefined) {
//                     currentHostName = item.children[0].children[0].data;
//                 }
//
//                 // Add links to return object
//                 if (item.children.filter(child => child.name === 'a').length > 0) {
//                     linksToReturn.premium.push({
//                         host_name: currentHostName,
//                         links: item.children.filter(child => child.name === 'a').map(child => child.attribs.href)
//                     });
//                 }
//             }
//         });
//
//         return linksToReturn
//
//     } catch(error) {
//         return error
//     }
// };
//
// /**
//  * Some cloudscrapper wrapper into promises
//  * @param options
//  * @returns {Promise<any>}
//  */
// const cloudScrapperRequest = async options => {
//     return new Promise((resolve, reject) => {
//         cloudscraper.request(
//             options , function(err, response, body) {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(body);
//                 }
//         });
//     })
// };
//
// // Second bloc - use quality selected (just url is needed)
// // to check availability and, if so, start download
//
// module.exports.getMovieQualities = getMovieQualities;
//
// module.exports.getUrls = getUrls;
//
// module.exports.getDownloadLinks = getDownloadLinks;
