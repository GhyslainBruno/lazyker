const puppeteer = require('puppeteer');
const logger = require('../../logs/logger');
const cheerio = require('cheerio');
const rp = require('request-promise');
const pmap = require('p-map');
const cloudscraper = require('../../utils/cloudscrapper/Cloudscrapper');

/**
 * get an host object an returns unprotected links for the host given
 * @param links
 * @param user
 * @returns {Promise<Array>}
 */
const getUnprotectedLinksWithPuppeteer = async function unprotectLinks(links, user) {

    let launchBrowserProperties = {};

    if (process.env.NODE_ENV === 'production') {
        launchBrowserProperties = {headless: true, timeout: 60000, executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox']}
    } else {
        launchBrowserProperties = {headless: false, timeout: 60000}
    }

    const browser = await puppeteer.launch(launchBrowserProperties);
    const page = await browser.newPage();

    try {
        if (links.length > 1) {

            const linksToReturn = await pmap(links, async link => {
                return await unprotectLinkWithPuppeteer(page, link, user);
            }, {concurrency: 1});


            browser.close();
            return linksToReturn

        } else {

            let linkToReturn = [];
            linkToReturn.push(await unprotectLinkWithPuppeteer(page, links[0], user));

            // TODO: understand why an "undefined" link is pushed inside the array sometimes...
            // linkToReturn = linkToReturn.filter(link => link !== undefined);
            browser.close();
            return linkToReturn
        }
    } catch (error) {
        logger.info(error, user)
    }
};

const getUnprotectedLinks = async function unprotectLinks(links) {

    try {
        if (links.length > 1) {

            const linksToReturn = await pmap(links, async link => {
                return await unprotectLink(link);
            }, {concurrency: 1});

            return linksToReturn

        } else {

            const linkToReturn = [];
            linkToReturn.push(await unprotectLink(links[0]));
            return linkToReturn
        }
    } catch (error) {
        console.log(error)
    }
};


/**
 * Unprotect a link dlprotect --> host link
 * @param page
 * @param link
 * @param user
 * @returns {Promise<*>}
 */
const unprotectLinkWithPuppeteer = async (page, link, user) => {
    try {

        await page.goto(link, {timeout: 60000});
        await page.waitForSelector("input[value=Continuer]");
        await page.click("input[value=Continuer]");
        await page.waitForSelector("body");
        const html = await page.evaluate(body => body.innerHTML, await page.$('body'));
        const $ = cheerio.load(html);
        return $('.lienet > a')[0].attribs.href;

    } catch(error) {
        logger.info(error, user);
        return error
    }
};

const unprotectLink = async (link) => {
    const options = {
        method: 'POST',
        uri: link,
        formData: {
            submit: 'Continuer'
        },
        json: true
    };

    try {
        const response = await rp(options);
        const $ = cheerio.load(response);

        return $('.lienet > a')[0].attribs.href;
    } catch (error) {
        logger.info(error, user);
        return error
    }
};

module.exports.getUnprotectedLinks = getUnprotectedLinks;
module.exports.getUnprotectedLinksWithPuppeteer = getUnprotectedLinksWithPuppeteer;