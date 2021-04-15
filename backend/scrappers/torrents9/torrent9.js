const cheerio = require('cheerio');
const rp  = require('request-promise');
const fs = require('fs');
const path = require('path');
const logger = require('../../logs/logger');
const Torrent9RootUrl = 'https://www.torrent9.vg';
const realdebrid = require('../../realdebrid/debrid_links');
// const puppeteer = require('puppeteer');
const parseTorrent = require('parse-torrent');

/**
 * Returns the real URL used by the website - anytime
 * @param Torrent9Url
 * @returns {Promise<void>}
 */
// const getRealUrl = async () => {
//     const options = {
//         method: 'GET',
//         uri: Torrent9RootUrl,
//         followRedirect: false
//     };
//
//     let urlToReturn = Torrent9RootUrl;
//
//     try {
//         const response = await rp(options);
//     } catch(error) {
//         urlToReturn = error.response.headers.location
//     }
//
//     return urlToReturn.replace(/\/$/, '');
// };

/**
 * Returns a list of Torrent9 torrents for a particular title
 * @param title
 * @returns {Promise<Array>}
 */
// const getTorrentsList = async title => {
//
//     let launchBrowserProperties = {};
//
//     if (process.env.NODE_ENV === 'production') {
//         launchBrowserProperties = {headless: true, ignoreHTTPSErrors: true, timeout: 60000, executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']}
//     } else {
//         launchBrowserProperties = {headless: false, timeout: 70000}
//     }
//
//     let browser = {};
//
//     try {
//         browser = await puppeteer.launch(launchBrowserProperties);
//         const page = await browser.newPage();
//         await page.goto(Torrent9RootUrl + '/recherche/' + title, {timeout: 60000});
//         await page.waitFor(8000);
//         await page.waitForSelector("body");
//         const html = await page.evaluate(body => body.innerHTML, await page.$('body'));
//         const $ = cheerio.load(html);
//
//         const items = $('.table-responsive > .table > tbody > tr');
//
//         const torrentsList = [];
//
//         items.map((i, result)  => {
//
//             torrentsList.push({
//                 provider: 'torrent9',
//                 title: result.children[1].children[2].attribs.title.replace('Télécharger ', '').replace(' en Torrent', ''),
//                 url: result.children[1].children[2].attribs.href,
//                 size: result.children[3].children[0].data,
//                 seed: result.children[5].children[0].children[0].data,
//                 leech: result.children[7].children[0].data
//             })
//
//         });
//
//         browser.close();
//
//         return {
//             provider: 'torrent9',
//             torrents: torrentsList
//         };
//
//     } catch(error) {
//         browser.close();
//         throw error;
//     }
//
// };

/**
 * Start the download of a torrent file
 * @param url
 * @param user
 * @param infos
 * @returns {Promise<null>}
 */
// const downloadTorrentFile = async (url, user, infos) => {
//
//     let launchBrowserProperties = {};
//
//     if (process.env.NODE_ENV === 'production') {
//         launchBrowserProperties = {headless: true, ignoreHTTPSErrors: true, timeout: 70000, executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-dev-shm-usage']}
//     } else {
//         launchBrowserProperties = {headless: false, timeout: 70000, args: ['--disable-dev-shm-usage']}
//     }
//
//     let browser = {};
//
//     try {
//         browser = await puppeteer.launch(launchBrowserProperties);
//
//         const page = await browser.newPage();
//         await page.goto(Torrent9RootUrl + url, {timeout: 70000});
//         await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.join(__dirname, '/torrent_temp')});
//
//         await page.waitFor(7000);
//         await page.waitForSelector("a.btn.btn-danger.download");
//         await page.click("a.btn.btn-danger.download");
//
//         await page.waitFor(7000);
//
//         // TODO extract this logic - which is commun to every torrent provider code - in a util part
//         // Get the torrent fileName
//         const torrentFileName = await getTorrentFileName();
//
//         // Parse torrent file to get info
//         const torrentInfos = parseTorrent(fs.readFileSync(__dirname + '/torrent_temp/' + torrentFileName));
//
//         // TODO understand why having some "announces" in infos of a torrent is a bad thing...
//         // For now, without flushing [announces] - torrent adding using magnet link don't work in realdebrid...
//         torrentInfos.announce = [];
//
//         // Create magnet link using torrent file infos
//         const magnetLink = parseTorrent.toMagnetURI(
//             torrentInfos
//         );
//
//         // Removing torrent file
//         await removeAllFiles(path.join(__dirname, 'torrent_temp'));
//
//         const rdTorrentInfo = await realdebrid.addMagnetLinkToRealdebrid(magnetLink, user, infos);
//
//         await realdebrid.selectAllTorrentFiles(rdTorrentInfo.id, user);
//
//         browser.close();
//
//         return null;
//
//     } catch(error) {
//
//         await logger.info(error, user);
//         browser.close();
//         throw error;
//     }
// };

/**
 * Removes all files of a particular directory (to use in torrent_temp directory)
 * @param directory
 * @returns {Promise<any>}
 */
// const removeAllFiles = directory => {
//     return new Promise((resolve, reject) => {
//         fs.readdir(directory, (err, files) => {
//             if (err) reject(err);
//
//             for (const file of files) {
//                 fs.unlink(path.join(directory, file), err => {
//                     if (err) reject(err);
//                 });
//             }
//             resolve();
//         });
//     })
// };

/**
 * Returns the torrent fileName (of the first torrent file found) ! CAREFULL ! In /torrent_temp/ folder an only one torrent file should exist
 * @param path
 * @returns {Promise<any>}
 */
// const getTorrentFileName = () => {
//     return new Promise(function(resolve, reject) {
//         fs.readdir(__dirname + '/torrent_temp/', (err, files) => {
//             if (!err) {
//                 files.forEach(file => {
//                     resolve(file);
//                 });
//             } else {
//                 reject(err);
//             }
//         });
//     })
// };

// module.exports.getTorrentsList = getTorrentsList;
module.exports.getTorrentsList = () => {};
// module.exports.downloadTorrentFile = downloadTorrentFile;
module.exports.downloadTorrentFile = () => {};
