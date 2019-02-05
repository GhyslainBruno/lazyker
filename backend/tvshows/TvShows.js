const ygg = require('../scappers/ygg/ygg');
const torrent9 = require('../scappers/torrents9/torrent9');

/**
 * Downloads episode torrent file to deriber's service
 * @param url
 * @param provider
 * @param mediaInfos
 * @param id
 * @param user
 * @returns {Promise<void>}
 */
const downloadEpisodeTorrentFile = async (url, provider, mediaInfos, id, user) => {

    try {
        switch (provider) {
            case 'ygg':
                await ygg.downloadTorrentFile(url, user, mediaInfos);
                break;
            case 'torrent9':
                await torrent9.downloadTorrentFile(url, user, mediaInfos);
                break;
            default:
                throw new Error('bad provider');
        }
    } catch(error) {

    }

};
module.exports.downloadEpisodeTorrentFile = downloadEpisodeTorrentFile;