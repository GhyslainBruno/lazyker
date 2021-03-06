const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const rp  = require('request-promise');
const request  = require('request');
const YGGRootUrl ='https://www2.yggtorrent.ch/';
const logger = require('../../logs/logger');
const fs = require('fs');
const path = require('path');
const torrentToMagnet = require('torrent-to-magnet');
const parseTorrent = require('parse-torrent');
const realdebrid = require('../../realdebrid/debrid_links');
const admin = require('firebase-admin');
const db = admin.database();
const usersRef = db.ref("/users");
// const userAgent = require('user-agents');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 *  Used to read headers responses in requests
 * @param body
 * @param response
 * @param resolveWithFullResponse
 * @returns {{headers: *, data: *, fullResponse: *}}
 * @private
 */
const _include_headers = function(body, response, resolveWithFullResponse) {
    return {'headers': response.headers, 'data': body, 'fullResponse': resolveWithFullResponse};
};

/**
 * Returns a list of Ygg torrents for a particular title
 * @param title
 * @returns {Promise<Array>}
 */
const getTorrentsList = async title => {

    // const width = 960;
    // const height = 1280;

    let launchBrowserProperties = {};

    if (process.env.NODE_ENV === 'production') {
        launchBrowserProperties = {headless: true, ignoreHTTPSErrors: true, timeout: 60000, executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']}
    } else {
        launchBrowserProperties = {headless: true, ignoreHTTPSErrors: true, timeout: 100000, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']}
    }

    let browser = {};

    try {

        title = title.replace(/[!-]/gi, '');

        // console.log(1);
        browser = await puppeteer.launch(launchBrowserProperties);
        // console.log(2);
        const page = await browser.newPage();
        // await page.setUserAgent(userAgent.toString());
        // await page.setViewport({ width, height });

        // await page.goto('https://bot.sannysoft.com');
        // await page.waitFor(5000);
        // await page.screenshot({ path: 'testresult.png', fullPage: true });

        // console.log(3);
        await page.goto(YGGRootUrl + 'engine/search?name=' + title + '&do=search&description=&file=&uploader=&category=2145', {timeout: 100000});

        // console.log(4);
        await page.waitFor(10000);
        // await page.mouse.move(0, 0);
        // await page.mouse.move(175, 341);
        // await page.mouse.down();
        // await page.mouse.up();
        // await page.mouse.click(175, 341, { button: 'left' });
        // await page.screenshot({path: 'list.png', fullPage: true });
        // console.log(5);
        await page.waitForSelector("body");
        // console.log(6);
        const html = await page.evaluate(body => body.innerHTML, await page.$('body'));
        // console.log(7);
        const $ = cheerio.load(html);
        // console.log(8);

        const tableRows = $('tr');
        const items = tableRows.splice(7, tableRows.length);

        const torrentsList = [];

        // console.log(9);
        items.map(item => {
            torrentsList.push({
                provider: 'ygg',
                title: item.children[3].children[0].children[0].data.replace(/\n/g,''),
                url: item.children[3].children[0].attribs.href,
                size: item.children[11].children[0].data,
                completed: item.children[13].children[0].data,
                seed: item.children[15].children[0].data,
                leech: item.children[17].children[0].data
            })
        });

        // console.log(10);
        browser.close();

        return {
            provider: 'ygg',
            torrents: torrentsList
        };

    } catch(error) {
        console.log(error.message);
        browser.close();
        throw error;
    }
};

/**
 * Start the download of a torrent file -> to magnetLink -> deletes torrent file -> add to realdebrid service
 * @param url
 * @param user
 * @param infos
 * @returns {Promise<null>}
 */
const downloadTorrentFile = async (url, user, infos) => {

    const width = 960;
    const height = 1280;

    let launchBrowserProperties = {};

    if (process.env.NODE_ENV === 'production') {
        launchBrowserProperties = {headless: true, ignoreHTTPSErrors: true, timeout: 70000, executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-dev-shm-usage', `--window-size=${height},${width}`, '--disable-gpu']}
    } else {
        launchBrowserProperties = {headless: true, timeout: 70000, args: ['--no-sandbox', '--disable-dev-shm-usage', `--window-size=${height},${width}`]}
    }

    let browser = {};

    try {
        // console.log(1);
        browser = await puppeteer.launch(launchBrowserProperties);

        // browser.addListener('targetdestroyed', async target => {
        //     console.log(target);
        // });



        // With puppeteer
        // TODO maybe use another YGG account
        // console.log(2);
        const page = await browser.newPage();

        // console.log(3);
        await page.goto(url, {timeout: 70000});
        await page.waitFor(10000);

        // console.log(4);
        await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.join(__dirname, '/torrent_temp')});

        // console.log(5);
        await page.setViewport({ width, height });

        // console.log(6);
        const pages = await browser.pages();
        await pages[0].close();

        // let html = await page.evaluate(body => body.innerHTML, await page.$('body'));
        // console.log(7);
        await page.waitForSelector("body");
        // console.log(8);
        // await page.screenshot({path: 'downloading.png', fullPage: true});
        await page.click("a.butt");

        // console.log(9);
        await page.type('input[name=id]', 'Ghyslain');
        await page.type('input[name=pass]', 'foobar');

        await page.keyboard.down('Enter');
        await page.type('input[name=id]', 'Ghyslain');
        await page.keyboard.down('Enter');

        // console.log(10);
        await page.waitForNavigation();
        await page.waitForSelector("a.butt");

        // Since now a click on the download buton opens a new popup window before starting the download, chromium crashes
        // see the #299 error https://github.com/GoogleChrome/puppeteer/issues/299
        // so I get the url value and fetch it normally
        // let torrentDownloadUrl = await page.evaluate((sel) => {
        //     return document.getElementsByClassName(sel)[0].href;
        // }, 'butt');

        // See here for the way https://stackoverflow.com/questions/48752822/request-promise-download-pdf-file
        // const optionsStart = {
        //     uri: torrentDownloadUrl,
        //     encoding: "binary",
        //     method: 'GET'
        // };
        // await rp(optionsStart)
        //     .then( async (body, data) => {
        //         let writeStream = fs.createWriteStream(path.join(__dirname, '/torrent_temp/file.torrent'));
        //         writeStream.write(body, 'binary');
        //         writeStream.end();
        //     });

        // Old way
        await page.click("a.butt");
        await page.waitFor(7000);

        // Get the torrent fileName
        const torrentFileName = await getTorrentFileName();

        // Parse torrent file to get info
        const torrentInfos = parseTorrent(fs.readFileSync(__dirname + '/torrent_temp/' + torrentFileName));

        // TODO understand why having some "announces" in infos of a torrent is a bad thing...
        // For now, without flushing [announces] - torrent adding using magnet link don't work in realdebrid...
        torrentInfos.announce = [];

        // Create magnet link using torrent file infos
        const magnetLink = parseTorrent.toMagnetURI(
            torrentInfos
        );

        // Removing torrent file
        await removeAllFiles(path.join(__dirname, 'torrent_temp'));

        const rdTorrentInfo = await realdebrid.addMagnetLinkToRealdebrid(magnetLink, user, infos);

        await realdebrid.selectAllTorrentFiles(rdTorrentInfo.id, user);

        browser.close();

        return null;


        // Without puppeteer
        // Ygg login
        // const sessionCookie = await yggLogin(db.getData('/configuration/ygg/username'), db.getData('/configuration/ygg/password'));

        // Get id of the torrent to download
        // const id = getTorrentId(url);

        // Start the actual download of the torrent file
        // await startTorrentDownload(id, sessionCookie);

    } catch(error) {

        await removeAllFiles(path.join(__dirname, 'torrent_temp'));
        await logger.info(error, user);
        browser.close();
        throw error;
    }
};

const closeAdTabs = async browser => {
    const pages = await browser.pages();
    let pageNumber = 0;
    pages.forEach(page => {

        if (pageNumber > 0) {
            page.close();
        }

        pageNumber++;
    })
};

/**
 * Removes a file
 * @param filePath
 * @returns {Promise<any>}
 */
const removeFile = filePath => {
    return new Promise( (resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) reject(err);
            resolve();
        });
    })
};

/**
 * Removes all files of a particular directory (to use in torrent_temp directory)
 * @param directory
 * @returns {Promise<any>}
 */
const removeAllFiles = directory => {
    return new Promise((resolve, reject) => {
        fs.readdir(directory, (err, files) => {
            if (err) reject(err);

            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) reject(err);
                });
            }
            resolve();
        });
    })
};

/**
 * Returns the torrent fileName (of the first torrent file found) ! CAREFULL ! In /torrent_temp/ folder an only one torrent file should exist
 * @param path
 * @returns {Promise<any>}
 */
const getTorrentFileName = () => {
    return new Promise(function(resolve, reject) {
        fs.readdir(__dirname + '/torrent_temp/', (err, files) => {
            if (!err) {
                files.forEach(file => {
                    resolve(file);
                });
            } else {
                reject(err);
            }
        });
    })
};

/**
 * Returns the id of the torrent to download
 * @param url
 * @returns {Promise<void>}
 */
const getTorrentId = (url, sessionCookie) => {
    // try {
    //     const options = {
    //         method: 'GET',
    //         uri: encodeURI(url),
    //         json: true,
    //         headers: {
    //             Cookie: 'ygg_' + sessionCookie
    //         }
    //     };
    //
    //     const response = await rp(options);
    //     const $ = cheerio.load(response);
    //
    //     console.log('foo')
    // } catch(error) {
    //     logger.info(error);
    //     throw error;
    // }

    return url.match(/film\/[0-9]*/g)[0].replace('film/','');
};

/**
 * Logs user in Ygg backend + return ygg_ token (use like that --> Cookie : ygg_=token)
 * @param login
 * @param password
 */
const yggLogin = async (login, password) => {
    try {
        const options = {
            method: 'GET',
            uri: 'https://ww3.yggtorrent.is/user/login',
            headers: {
                'Accept': '*/*',
                'Referer': 'https://ww3.yggtorrent.is/',
                'Origin': 'https://ww3.yggtorrent.is',
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
                'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundarysVtvI3VAcCFU0HoO',

                // 'Cache-Control': 'no-cache',
                // 'content-type': 'application/x-www-form-urlencoded',
                // 'Connection': 'keep-alive',
                // 'Content-Encoding': 'gzip'
            },
            formData: {
                id: login,
                pass: password
            },
            followAllRedirects: true,
            transform: _include_headers,
        };

        const response = await rp(options);

        // Where the session cookie is stored
        return response.headers['set-cookie'][0].match(/ygg_=[a-z0-9]*/g)[0];
    } catch(error) {
        throw error;
    }
};

/**
 * Start the download of the torrent file to (some temporary place in the file system)
 * @param torrentId
 * @param sessionCookie
 * @returns {Promise<void>}
 */
const startTorrentDownload = async (torrentId, sessionCookie) => {

    let cookie = new tough.Cookie({
        key: "ygg_",
        value: sessionCookie.replace('ygg_=','').toString(),
        path: '/',
        domain: '.ww3.yggtorrent.is',
        httpOnly: true,
        maxAge: 31536000
    });

    const cookieJar = rp.jar();
    cookieJar.setCookie(cookie.toString(), 'https://ww3.yggtorrent.is');

    const options = {
        method: 'GET',
        url: 'https://ww3.yggtorrent.is/engine/download_torrent?id=' + torrentId,
        encoding: null,
        jar: cookieJar
        // headers: {
        //     'Cookie': sessionCookie
        // }
    };

    // Try using request
    // request(options, function (error, response, body) {
    //     if (!error) {
    //         const buffer = Buffer.from(response, 'utf8');
    //         fs.writeFileSync('torrent_temp/torrent_temp.torrent', buffer);
    //         console.log('torrent download done');
    //     } else {
    //         logger.info(error);
    //         throw error;
    //     }
    // });

    // try using request promise
    await rp(options)
        .then((body, data) => {
            let writeStream = fs.createWriteStream('torrent_temp/file.torrent');
            // console.log(body);
            writeStream.write(body, 'binary');
            writeStream.on('finish', () => {
                console.log('wrote all data to file');
            });
            writeStream.end();
        })
        .catch(error => {
            throw error;
        })
};

module.exports.getTorrentsList = getTorrentsList;
module.exports.downloadTorrentFile = downloadTorrentFile;
