
/**
 * Get a list of files at a particular place in filesystme - on synology nas
 * @param path
 * @param syno
 * @returns {Promise<void>}
 */
const getFilesList = (path, syno) => {

    return new Promise((resolve, reject) => {
        syno.fs.list({'folder_path': path }, (error, data) => {
            if (!error) {
                resolve(data);
            } else {
                reject(error);
            }
        });
    });


};

module.exports.getFilesList = getFilesList;