// const admin = require("firebase-admin");
// const rp = require('request-promise');

import * as admin from 'firebase-admin'
import rp from 'request-promise';

const db = admin.database();
const usersRef = db.ref("/users");
const pMap = require('p-map');
const logger = require('../logs/logger');

const tmdbApiKey = '7d7d89a7c475b8fdc9a5203419cb3964';
const searchTvTmdbUrl = 'https://api.themoviedb.org/3/search/tv';

const autoupdateNAS = require('../tvshows/autoupdate/nas/Main');
const autoupdateGdrive = require('../tvshows/autoupdate/gdrive/Main');

module.exports = (app: any) => {

    /**
     * List tv shows
     */
    app.get('/api/shows', async function(req: any, res: any) {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            const snapshot = await usersRef.child(user.uid).child('/shows').once('value');
            const shows = snapshot.val();

            // Adding a "total" property
            if (shows) {
                const showsFormattedToReturn = Object.keys(shows).map(showId => shows[showId]);
                res.send({shows: showsFormattedToReturn, total: showsFormattedToReturn.length});
            } else {
                res.send({total: 0});
            }

        } catch(error) {
            res.status(500).send({message: error});
        }
    });

    /**
     * Add a new tv show
     */
    app.post('/api/show', async (req: any, res: any) => {

        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            await usersRef.child(user.uid).child('/shows').child(req.body.show.id).set(req.body.show);
            res.send({message: 'Show added'});
        } catch(error) {
            res.status(500).send({message: error});
        }

    });

    /**
     * Delete a tv show
     */
    app.delete('/api/show', async (req: any, res: any) => {

        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            await usersRef.child(user.uid).child('/shows').child(req.body.show.id).remove();
            res.send({message: 'Show removed'});
        } catch(error) {
            res.status(500).send({message: error});
        }

    });

    /**
     * Get tv show info
     */
    app.get('/api/show/:id', async (req: any, res: any) => {

        const showId = req.params.id;

        const options = {
            method: 'GET',
            uri: 'https://api.themoviedb.org/3/tv/' + showId + '?api_key=' + tmdbApiKey + '&language=en-US',
            json: true
        };

        try {
            let results = await rp(options);

            const lastSeasonInformations = results.seasons.filter((season: any) => season.season_number === Math.max.apply(Math, results.seasons.map(function(o: any) { return o.season_number; })))[0];

            const show = {
                // lastSeason:  lastSeasonInformations.season_number,
                // lastEpisode:  lastSeasonInformations.episode_count,
                seasonsEpisodesNumbers: results.seasons,
                id: parseInt(showId)
            };

            res.send({
                message: 'ok',
                show: show
            })
        }
        catch(error) {
            res.send(error)
        }

    });

    /**
     * Update a tv show
     */
    app.put('/api/show', async (req: any, res: any) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            await usersRef.child(user.uid).child('/shows').child(req.body.show.id).set(req.body.show);
            res.send({message: 'Show updated'});
        } catch(error) {
            res.status(500).send({message: error});
        }
    });

    /**
     * Searching tv show
     */
    app.get('/api/search_shows', async (req: any, res: any) => {

        const title = req.query.title;

        const options = {
            method: 'GET',
            uri: searchTvTmdbUrl + '?api_key=' + tmdbApiKey + '&language=en-US&query=' + encodeURI(title) + '&page=1',
            json: true
        };

        try {
            let results = await rp(options);

            // Get only wanted fields in tmdb api response
            results = results.results.map((show: any) => {

                const posterPath = show.poster_path;
                const title = show.original_name;
                const id = show.id;

                if (posterPath !== null && title !== null) {
                    return {posterPath: posterPath, title: title, id: id, autoUpdate: true, lang: 'vostfr', episode: false}
                } else {
                    return null
                }

            });

            // Removing tv shows without title or poster path
            results = results.filter((show: any) => show !== null);

            res.send({shows: results, total: results.length});
        }
        catch(error) {
            res.send(error)
        }
    });

    /**
     * Clears all new episodes tags (basically when firstly listing tv shows)
     */
    app.get('/api/clear_new_episodes', async (req: any, res: any) => {

        // Using multi-path update, for more information please visit https://www.youtube.com/watch?v=i1n9Kw3AORw
        try {

            const user = await admin.auth().verifyIdToken(req.headers.token);
            const snapshot = await usersRef.child(user.uid).child('/shows').once('value');

            const shows = snapshot.val();

            if (shows) {

                let showsKeys = Object.keys(shows);
                let updateObject: any = {};


                showsKeys.forEach(key => {
                    updateObject[`/users/${user.uid}/shows/${key}/episode`] = false;
                });

                await db.ref('/').update(updateObject);

                res.send({shows: shows, total: Object.keys(shows).length});
            } else {
                res.send({message: 'ok'});
            }

        } catch(error) {
            res.status(500).send({
                message: error
            })
        }
    });

    /**
     * Starts an autoupdate task for every users
     */
    app.get('/api/autoupdate_start', async (req: any, res: any) => {

        try {

            res.send({message: 'Auto-update started'});

            // TODO handle gdrive or nas depending on settings selection
            await autoupdateGdrive.startUpdate(await admin.auth().getUser("OmbDjWXTCdb5ZusQTyOP2Psa1Ws1"));

            // // Only keeping 'nas' users for now to autoupdate tvShows
            // const snapshot = await usersRef.child('/').orderByChild('/settings/storage').equalTo('nas').once('value');
            // const users = snapshot.val();

            // Starting auto update with users who only use NAS storage & have entered values into the mandatory variables
            // const usersToUpdateTvShows = Object.keys(users).filter(user => {
            //
            //     if (users[user].settings.qualities.first !== undefined &&
            //         users[user].settings.nas.account !== undefined &&
            //         users[user].settings.nas.password !== undefined &&
            //         users[user].settings.nas.port !== undefined &&
            //         users[user].settings.nas.protocol !== undefined &&
            //         users[user].settings.nas.host !== undefined &&
            //         users[user].settings.nas.tvShowsPath !== undefined) {
            //
            //         return users[user]
            //
            //     }
            // });

            // await pMap(usersToUpdateTvShows, async uid => {
            //
            //     try {
            //         // NAS way
            //         // await autoupdate.startUpdate(await admin.auth().getUser(uid));
            //
            //         // Gdrive way
            //         await autoupdate.startUpdate(await admin.auth().getUser("TFbtVsqJfPMpUhsoWh7ETYMipqY2"));
            //     } catch(error) {
            //         await logger.info(error.message, await admin.auth().getUser(uid));
            //     }
            //
            // }, {concurency: 1});

        } catch(error) {
            // await logger.info(error.message, user);
            console.log(error.message);
        }
    });

};
