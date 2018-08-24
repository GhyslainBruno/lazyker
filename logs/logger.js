const fs = require('fs');
const path = require('path');

/**
 *
 * @param textToLog
 */
const info = textToLog => {
    let time = new Date().toISOString().replace(/\..+/, '').replace(/^.*T/,'') + " | ";
    time = '\n' + time;

    fs.appendFile(path.join(__dirname, 'stdout.txt'), time + textToLog , function(err) {
        if(err) {
            return console.log(err);
        }
    });

    console.log(time + textToLog);
} ;

/**
 * Simple function to add time when logging info
 * @type {info}
 */
module.exports.info = info;