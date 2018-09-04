// const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const rp = require('request-promise');
const pmap = require('p-map');

/**
 * get an host object an returns unprotected links for the host given
 * @param links
 * @returns {Promise<Array>}
 */
const getUnprotectedLinks = async function unprotectLinks(link) {

    const browser = await puppeteer.launch({headless: false, timeout: 60000});
    const page = await browser.newPage();

    try {

        return await unprotectLink(page, link);

        // if (links.length > 1) {
        //
        //     const linksToReturn = await pmap(links, async link => {
        //         return await unprotectLink(page, link);
        //     }, {concurrency: 1});
        //
        //
        //     browser.close();
        //     return linksToReturn
        //
        // } else {
        //
        //     const linkToReturn = [];
        //     linkToReturn.push(await unprotectLink(page, links[0]));
        //     browser.close();
        //     return linkToReturn
        // }
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
const unprotectLink = async (page, link) => {
    try {

        // await page.setRequestInterception(true);
        // page.on('request', request => {
        //     if (request.resourceType() === 'image')
        //         request.abort();
        //     else
        //         request.continue();
        // });

        await page.goto(link, {timeout: 60000});
        await page.waitForSelector("input[id=submit_button]");
        await page.click("input[id=submit_button]");
        await page.waitForSelector("body");
        const html = await page.evaluate(body => body.innerHTML, await page.$('body'));
        const $ = cheerio.load(html);
        return $('.lienall_lienset > a')[0].attribs.href;

    } catch(error) {
        return error
    }
};

module.exports.getUnprotectedLinks = getUnprotectedLinks;