const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const rp = require('request-promise');
const pmap = require('p-map');
const cloudscraper = require('../../utils/cloudscrapper/Cloudscrapper');

/**
 * get an host object an returns unprotected links for the host given
 * @param links
 * @returns {Promise<Array>}
 */
const getUnprotectedLinksWithPuppeteer = async function unprotectLinks(links) {

    let launchBrowserProperties = {};

    if (process.env.NODE_ENV === 'production') {
        launchBrowserProperties = {headless: false, timeout: 60000, executablePath: '/usr/bin/chromium-browser'}
    } else {
        launchBrowserProperties = {headless: true, timeout: 60000}
    }

    const browser = await puppeteer.launch(launchBrowserProperties);
    const page = await browser.newPage();

    try {
        if (links.length > 1) {

            const linksToReturn = await pmap(links, async link => {
                return await unprotectLinkWithPuppeteer(page, link);
            }, {concurrency: 1});


            browser.close();
            return linksToReturn

        } else {

            const linkToReturn = [];
            linkToReturn.push(await unprotectLinkWithPuppeteer(page, links[0]));
            browser.close();
            return linkToReturn
        }
    } catch (error) {
        console.log(error)
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
 * @returns {Promise<*>}
 */
const unprotectLinkWithPuppeteer = async (page, link) => {
    try {

        await page.goto(link, {timeout: 60000});
        await page.waitForSelector("input[value=Continuer]");
        await page.click("input[value=Continuer]");
        await page.waitForSelector("body");
        const html = await page.evaluate(body => body.innerHTML, await page.$('body'));
        const $ = cheerio.load(html);
        return $('.lienet > a')[0].attribs.href;

    } catch(error) {
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
        return error
    }
};

module.exports.getUnprotectedLinks = getUnprotectedLinks;
module.exports.getUnprotectedLinksWithPuppeteer = getUnprotectedLinksWithPuppeteer;