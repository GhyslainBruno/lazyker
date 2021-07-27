// const cloudscraper = require('cloudscraper');
//
// /**
//  *
//  * @param url
//  * @returns {Promise<any>}
//  */
// function cloudScrapperGet(url) {
//     return new Promise((resolve, reject) => {
//         cloudscraper.get(url, function(error, response, html) {
//             if (!error) {
//                 resolve(html)
//             } else {
//                 reject(error)
//             }
//         })
//     })
// }
//
// /**
//  *
//  * @param url
//  * @param data
//  * @returns {Promise<any>}
//  */
// function cloudscrapperPost(url, data) {
//     return new Promise((resolve, reject) => {
//         cloudscraper.post(url, data, function(error, response, body) {
//             if (!error) {
//                 resolve(body)
//             } else {
//                 reject(error)
//             }
//         })
//     })
// }
//
// /**
//  *
//  * @param options
//  * @returns {Promise<any>}
//  */
// function cloudscrapperRequest(options) {
//     return new Promise((resolve, reject) => {
//         cloudscraper.request(options, function(error, response, body) {
//             if (!error) {
//                 resolve(body)
//             } else {
//                 reject(error)
//             }
//         })
//     })
// }
//
//
//
// module.exports.cloudScrapperGet = cloudScrapperGet;
// module.exports.cloudscrapperPost = cloudscrapperPost;
// module.exports.cloudscrapperRequest = cloudscrapperRequest;
