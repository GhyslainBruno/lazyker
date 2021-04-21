// const cheerio = require('cheerio');
// const rp  = require('request-promise');
// const stringSimilarity = require('string-similarity');
// const pMap = require('p-map');
// const dlProtect = require('../../../../scrappers/zonetelechargement/dlprotect1com');
// const realdebrid = require('../../../../debriders/realdebrid/debrid_links');
// const logger = require('../../../../logs/logger');
// const admin = require("firebase-admin");
// const db = admin.database();
// const usersRef = db.ref("/users");
// const database = require('../../common/Database');
// // const CloudflareBypasser = require('cloudflare-bypasser');
//
// // let cf = new CloudflareBypasser();
//
// const ZTRootUrl = 'https://www.annuaire-telechargement.com/';
//
// /**
//  * Returns the real URL used by the website - anytime
//  * @param ZTRootUrl
//  * @returns {Promise<void>}
//  */
// const getRealUrl = async () => {
//     const options = {
//         method: 'POST',
//         "rejectUnauthorized": false,
//         uri: ZTRootUrl + 'index.php?do=search',
//         formData: {
//             do: 'search',
//             subaction: 'search',
//             story: 'foo',
//             search_start: 0,
//             full_search: 1,
//             result_from: 1,
//             titleonly: 3,
//             searchuser: '',
//             replyless: '',
//             replylimit: '',
//             searchdate: '' ,
//             beforeafter: 'after',
//             sortby: 'date',
//             resorder: 'desc',
//             showposts: 0,
//             'catlist[]': 2,
//         }
//     };
//
//     let urlToReturn = ZTRootUrl;
//
//     try {
//         const response = await rp(options);
//     } catch(error) {
//         urlToReturn = error.response.headers.location
//     }
//
//     return urlToReturn
// };
//
// export const getLink = async (show: any, user: any, qualities: any) => {
//     try {
//
//         const showUrl = await getTvShowPage(show.name);
//
//         // const qualities = await getQualities(database);
//
//         const lang = await database.getLangWantedForThisTvShow(show, user);
//
//         const hostLinksWithQuality = await getHostsWithQualities(show, qualities, showUrl, lang, user);
//
//         return await realdebrid.getBetterLink(hostLinksWithQuality, user);
//
//     } catch(error) {
//         await logger.info(error, user)
//     }
// };
//
// /**
//  * Returns the best URL for the tv show wanted - TODO refacto some code in here
//  * @param title
//  * @returns {Promise<*>}
//  */
// const getTvShowPage = async (title: any) => {
//
//     let ZTRealUrl = await getRealUrl();
//
//     ZTRealUrl = ZTRealUrl.replace('/index.php?do=search', '');
//
//     const options = {
//         method: 'POST',
//         "rejectUnauthorized": false,
//         uri: ZTRealUrl,
//         formData: {
//             do: 'search',
//             subaction: 'search',
//             story: title
//         },
//         followAllRedirects: false,
//         json: true
//     };
//
//     try {
//
//         const response = await rp(options);
//         const $ = cheerio.load(response);
//
//         // const results = $('.cover_global');
//         const results = $('.cover_infos_global > .cover_infos_title > a');
//
//         const searchResults: any[] = [];
//
//         results.map((i: number, result: any) => {
//
//             searchResults.push({
//                 url: result.attribs.href,
//                 matchResult: stringSimilarity.compareTwoStrings(title, result.children[0].data.replace(/ -.*$/, '')),
//                 title: result.children[0].data
//             })
//         });
//
//
//         // First, get the max vote from the array of objects
//         const maxMatchNumber = Math.max(...searchResults.map(result => result.matchResult));
//
//         // Get the object having votes as max votes
//         const bestSearchResult = searchResults.find(result => result.matchResult === maxMatchNumber);
//
//         if (bestSearchResult.matchResult < 0.5) {
//             // Here no usable result has been found
//             return null
//         } else {
//             return bestSearchResult.url;
//         }
//
//     } catch(error) {
//         return error
//     }
// };
//
// /**
//  * Returns Array.firstQualityLinks=[Hostlink], Array.secondQualityLinks=[Hostlink] etc...
//  * @param show
//  * @param qualities
//  * @param showUrl
//  * @param langWanted
//  * @param user
//  * @returns {Promise<Array>}
//  */
// const getHostsWithQualities = async (show: any, qualities: any, showUrl: any, langWanted: any, user: any) => {
//     try {
//         const options = {
//             method: 'GET',
//             "rejectUnauthorized": false,
//             uri: showUrl,
//             json: true
//         };
//
//         const possibleQualities = ['720p', '1080p', 'hdtv', 'web-dl', 'bdrip'];
//
//         const response = await rp(options);
//         const $ = cheerio.load(response);
//
//         const allQualities = $('.otherversions > a');
//         const currentPageQualityAndLang = $('.smallsep');
//
//         const currentPageSeasonNumber = parseInt(currentPageQualityAndLang[0].next.next.children[3].data.match(/Saison [0-9]+/g)[0].match(/[0-9]+/g)[0]);
//         const currentPageLang = currentPageQualityAndLang[0].next.next.children[0].data.split('|')[1].toLowerCase().match(/[a-z]+/g)[0];
//         const currentPageQuality = currentPageQualityAndLang[0].next.next.children[0].data.split('|')[0].replace('Qualité', '').toLowerCase().match(/[a-z]+/g)[0];
//
//         // Working only with qualities for other seasons (for now, below is the next things)
//         const otherQualities = allQualities.filter((i: number,quality: any) => quality.children[0].children[0].next.children[0].data !== undefined);
//
//         let otherQualitiesToUse = [];
//
//
//         // Add other qualities for all other seasons
//         otherQualities.map((index: number, otherQuality: any) => {
//
//             const qualityString = otherQuality.children[0].children[1].children[1].children[0].data.toLowerCase();
//
//             otherQualitiesToUse.push({
//                 url: otherQuality.attribs.href,
//                 seasonNumber: parseInt(otherQuality.children[0].children[0].next.children[0].data),
//                 quality: stringSimilarity.findBestMatch(qualityString, possibleQualities).bestMatch.target,
//                 lang: otherQuality.children[0].children[1].children[2].children[0].data.toLowerCase().match(/[a-z]+/g)[0]
//             })
//         });
//
//
//         // Add the other qualities for the current season
//         const currentPageOtherQualities = allQualities.filter((i: number,quality: any) => quality.children[0].children[0].next.children[0].data === undefined);
//         currentPageOtherQualities.map((index: number, otherQuality: any) => {
//
//             const qualityString = otherQuality.children[0].children[0].children[0].children[0].data.toLowerCase();
//
//             otherQualitiesToUse.push({
//                 url: otherQuality.attribs.href,
//                 seasonNumber: currentPageSeasonNumber,
//                 quality: stringSimilarity.findBestMatch(qualityString, possibleQualities).bestMatch.target,
//                 lang: otherQuality.children[0].children[1].children[0].children[0].data.toLowerCase().match(/[a-zA-Z]+/g)[0]
//             })
//         });
//
//         // Add the quality of the current page
//         otherQualitiesToUse.push({
//             url: '/' + showUrl.match(/[^\/]+/g).pop(),
//             seasonNumber: currentPageSeasonNumber,
//             quality: currentPageQuality,
//             lang: currentPageLang
//         });
//
//         // Get qualities only for the season wanted
//         let qualitiesForSeasonWanted =  otherQualitiesToUse.filter(otherQuality => otherQuality.seasonNumber === parseInt(show.lastSeason));
//
//         qualitiesForSeasonWanted = qualitiesForSeasonWanted.filter(quality => quality.lang === langWanted);
//
//         let linksWithQualityWanted = {
//             // @ts-ignore
//             firstQualityLinks: undefined,
//             // @ts-ignore
//             secondQualityLinks: undefined,
//             // @ts-ignore
//             thirdQualityLinks: undefined
//         };
//
//         if (qualities.hasOwnProperty('first')) {
//             linksWithQualityWanted.firstQualityLinks = qualitiesForSeasonWanted.filter(qualityForSeasonWanted => qualityForSeasonWanted.quality === qualities.first);
//         }
//
//         if (qualities.hasOwnProperty('second')) {
//             linksWithQualityWanted.secondQualityLinks = qualitiesForSeasonWanted.filter(qualityForSeasonWanted => qualityForSeasonWanted.quality === qualities.second);
//         }
//
//         if (qualities.hasOwnProperty('third')) {
//             linksWithQualityWanted.thirdQualityLinks = qualitiesForSeasonWanted.filter(qualityForSeasonWanted => qualityForSeasonWanted.quality === qualities.third);
//         }
//
//         let hostLinksToReturn: any[] = [];
//
//         // Now, for each link in linksWithQualityWanted, get the host link of the episode wanted
//         for (let quality in linksWithQualityWanted) {
//
//             // @ts-ignore
//             hostLinksToReturn[quality] = [];
//
//             // @ts-ignore
//             await pMap(linksWithQualityWanted[quality], async (linkToGetHostLinks: any) => {
//
//                 let ZTRealUrl = await getRealUrl();
//                 ZTRealUrl = ZTRealUrl.replace('/index.php?do=search', '');
//
//                 const options = {
//                     method: 'GET',
//                     "rejectUnauthorized": false,
//                     uri: ZTRealUrl + linkToGetHostLinks.url,
//                     json: true
//                 };
//
//                 const response = await rp(options);
//                 const $ = cheerio.load(response);
//
//                 const dlProtectLinksForThisEpisode = $('.postinfo > b').toArray().filter((item: any) => item.children[0].children[0].data === 'Episode ' + parseInt(show.lastEpisode));
//                 const dlProtectLinksForThisEpisodeClean = dlProtectLinksForThisEpisode.map((item: any) => item.children[0].attribs.href);
//
//                 if (dlProtectLinksForThisEpisodeClean.length > 0) {
//                     const unProtectedLinks = await dlProtect.getUnprotectedLinksWithPuppeteer(dlProtectLinksForThisEpisodeClean, user);
//                     // @ts-ignore
//                     hostLinksToReturn[quality] = hostLinksToReturn[quality].concat(unProtectedLinks) ;
//                 }
//
//             }, {concurrency: 1});
//         }
//
//         return hostLinksToReturn;
//
//     } catch(error) {
//         throw error;
//     }
//
// };
//
//
//
// /**
//  * Returns qualities in same format as other scrappers
//  * @param db
//  * @returns {Promise<{}>}
//  */
// const getQualities = async (db: any) => {
//     const qualitiesFromDb = db.getData('/configuration/qualities');
//
//     return Object.keys(qualitiesFromDb)
//         .filter(key => qualitiesFromDb[key] !== "none")
//         .reduce((obj, key) => {
//             obj[key] = qualitiesFromDb[key];
//             return obj;
//         }, {});
// };
//
// module.exports.getLink = getLink;
