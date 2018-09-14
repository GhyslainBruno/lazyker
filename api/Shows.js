const admin = require("firebase-admin");
const rp = require('request-promise');
const db = admin.database();
const usersRef = db.ref("/users");

const tmdbApiKey = '7d7d89a7c475b8fdc9a5203419cb3964';
const searchTvTmdbUrl = 'https://api.themoviedb.org/3/search/tv';

module.exports = (app) => {

    /**
     * List tv shows
     */
    app.get('/api/shows', async function(req, res) {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            const snapshot = await usersRef.child(user.uid).child('/shows').once('value');

            const shows = snapshot.val();

            // Adding a "total" property
            if (shows) {
                res.send({shows: shows, total: Object.keys(shows).length});
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
    app.post('/api/show', async (req, res) => {

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
    app.delete('/api/show', async (req, res) => {

        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            await usersRef.child(user.uid).child('/shows').child(req.body.show.id).remove();
            res.send({message: 'Show removed'});
        } catch(error) {
            res.status(500).send({message: error});
        }

    });

    /**
     * Update a tv show
     */
    app.put('/api/show', async (req, res) => {
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
    app.get('/api/search_shows', async (req, res) => {

        const title = req.query.title;

        const options = {
            method: 'GET',
            uri: searchTvTmdbUrl + '?api_key=' + tmdbApiKey + '&language=en-US&query=' + encodeURI(title) + '&page=1',
            json: true
        };

        try {
            let results = await rp(options);

            // Get only wanted fields in tmdb api response
            results = results.results.map(show => {

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
            results = results.filter(show => show !== null);

            res.send({shows: results, total: results.length});
        }
        catch(error) {
            res.send(error)
        }
    });

    /**
     * Clears all new episodes tags (basically when firstly listing tv shows)
     */
    app.get('/api/clear_new_episodes', async (req, res) => {

        // Using multi-path update, for more information please visit https://www.youtube.com/watch?v=i1n9Kw3AORw
        try {

            const user = await admin.auth().verifyIdToken(req.headers.token);
            const snapshot = await usersRef.child(user.uid).child('/shows').once('value');

            const shows = snapshot.val();

            if (shows) {

                let showsKeys = Object.keys(shows);
                let updateObject = {};


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

};