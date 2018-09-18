const rp = require('request-promise');

/**
 * ! WARNING ! File not functional for now !
 * @returns {Promise<*>}
 */

const getSid = async () => {
    try {
        db.reload();
        const nasConfiguration = db.data.configuration.nas;

        const options = {
            method: 'GET',
            uri: nasConfiguration.protocol +
                '://' + nasConfiguration.host + ':' + nasConfiguration.port +
                '/webapi/auth.cgi?api=SYNO.API.Auth&version=6&method=login&account=' +
                nasConfiguration.account + '&passwd=' + nasConfiguration.password +
                '&session=DownloadStation&format=sid'
            ,
            json: true
        };

        const resp = await rp(options);
        return resp.data.sid;

    } catch(error) {
        console.log(error);
        throw error
    }
};

const resumeDownload = async (downloadId) => {

    try {
        db.reload();
        const nasConfiguration = db.data.configuration.nas;

        const options = {
            method: 'GET',
            uri: nasConfiguration.protocol +
                '://' + nasConfiguration.host + ':' + nasConfiguration.port +
                '/webapi/DownloadStation/task.cgi?api=SYNO.DownloadStation.Task&version=3&method=resume&id=' + downloadId +
                '&sid=' + await getSid()
            ,
            json: true
        };

        return await rp(options);
    } catch(error) {
        console.log(error);
        throw error
    }

};

const pauseDownload = async (downloadId) => {

};

const removeDownload = async (downloadId) => {

};

module.exports.resumeDownload = resumeDownload;
module.exports.pauseDownload = pauseDownload;
module.exports.removeDownload = removeDownload;