/**
 * Some utils code to not send multiple res when downloading multiple files from a torrent (realdebrid into google drive)
 */
let hasAlreadyBeenHere = false;

const isFirstTime = () => {
    return !hasAlreadyBeenHere;
};
module.exports.isFirstTime = isFirstTime;

const checkPassage = () => {
    hasAlreadyBeenHere = true;
};
module.exports.checkPassage = checkPassage;

const initPassage = () => {
    hasAlreadyBeenHere = false;
};
module.exports.initPassage = initPassage;