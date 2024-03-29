const yggScrapper = require('../../../../scrappers/ygg/ygg');
const logger = require('../../../../logs/logger');
const database = require('../../common/Database');

/**
 * Returns a downloadable debrider link
 * @param show
 * @param user
 * @param qualities
 * @returns {Promise<void>}
 */
export const getLink = async (show: any, user: any, qualities: any) => {

    try {

        const torrentsList = await yggScrapper.getTorrentsList(`${show.name} S${show.lastSeason}E${show.lastEpisode}`);

        // If no torrent is found, returning null to try with the next season
        if (torrentsList.torrents.length === 0) return null;

        const lang = await database.getLangWantedForThisTvShow(show, user);

        const langFilteredTorrents = await filterTorrentsWithLang(torrentsList.torrents, lang);

        const qualitiesFilteredTorrents = await filterTorrentsWithQualities(langFilteredTorrents, qualities);

        const numbersFilteredTorrents = await filterTorrentsWithNumber(qualitiesFilteredTorrents, show);

        const heavierTorrent = await getHeavierTorrent(numbersFilteredTorrents);

        return heavierTorrent.url;

        // Here should wait and check in an interval if the torrent is downloaded into debrider's service, and then return a downloadable link


    } catch(error) {
        await logger.info(error, user);
        throw error;
    }

};
module.exports.getLink = getLink;

/**
 * Download torrent file to debrider's service and store info in db
 * @param url
 * @param user
 * @param show
 * @returns {Promise<void>}
 */
const downloadTorrent = async (url: any, user: any, show: any) => {
    // Download torrent file into debrider's service and store some torrent infos into db
    // TODO can it be done directly in the next line ?
    show.isShow = true;
    return await yggScrapper.downloadTorrentFile(url, user, show);
};
module.exports.downloadTorrent = downloadTorrent;

/**
 * * Filters a show, based on its name/title, with the lang wanted
 * @param torrents
 * @param lang
 * @returns {Promise<void>}
 */
const filterTorrentsWithLang = async (torrents: any, lang: any) => {
    const regex = new RegExp("(" + lang + ")", 'gi');
    return torrents.filter((torrent: any) => torrent.title.match(regex));
};

/**
 * Filters a show, based on its name/title, with the qualities wanted
 * if thr first quality wanted is present -> returning only torrents of the first quality (same for 2nd and 3rd)
 * @param torrents
 * @param qualities
 * @returns {Promise<void>}
 */
const filterTorrentsWithQualities = async (torrents: any, qualities: any) => {
    const regexFirstQuality = new RegExp("(" + qualities.first + ")", 'gi');
    const regexSecondQuality = new RegExp("(" + qualities.second + ")", 'gi');
    const regexThirdQuality = new RegExp("(" + qualities.third + ")", 'gi');

    const filteredTorrentsWithFirstQuality = torrents.filter((torrent: any) => torrent.title.match(regexFirstQuality));
    const filteredTorrentsWithSecondQuality = torrents.filter((torrent: any) => torrent.title.match(regexSecondQuality));
    const filteredTorrentsWithThirdQuality = torrents.filter((torrent: any) => torrent.title.match(regexThirdQuality));

    if (filteredTorrentsWithFirstQuality.length > 0) {
        return filteredTorrentsWithFirstQuality;
    } else if (filteredTorrentsWithSecondQuality.length > 0) {
        return filteredTorrentsWithSecondQuality;
    } else if (filteredTorrentsWithThirdQuality > 0) {
        return filteredTorrentsWithThirdQuality;
    } else {
        throw new Error('No torrent of episode found for qualities specified');
    }
};

/**
 * Filters a show, based on its name/title, with the episode/season wantedx
 * @param torrents
 * @param show
 * @returns {Promise<void>}
 */
const filterTorrentsWithNumber = async (torrents: any, show: any) => {
    const regex = new RegExp("(" + `s${show.lastSeason}e${show.lastEpisode}` + ")", 'gi');
    return torrents.filter((torrent: any) => torrent.title.match(regex));
};

/**
 * Returns the heavier torrent - doing this to download the better quality foundable
 * -> using unlimited google drive storages, so don't really care for now
 * @param torrents
 */
const getHeavierTorrent = (torrents: any) => {
    return torrents.reduce((previous: any, current: any) => (parseInt(previous.size) > parseInt(current.size)) ? previous : current);
};
