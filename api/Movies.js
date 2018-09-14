const Movies = require('../movies/Movies');
const admin = require("firebase-admin");
const db = admin.database();
const rp = require('request-promise');
const tmdbApiKey = '7d7d89a7c475b8fdc9a5203419cb3964';
const searchTvTmdbUrl = 'https://api.themoviedb.org/3/search/tv';
const usersRef = db.ref("/users");

module.exports = (app) => {

    /**
     * List TMDB movies - using genres
     */
    app.get('/api/movies', async (req, res) => {

        const genreWanted = req.query.genre;
        const page = req.query.page;

        let url = '';

        switch (genreWanted) {
            case 'popular':
                url = 'https://api.themoviedb.org/3/movie/popular' + '?api_key=' + tmdbApiKey + '&language=fr-FR&page=' + page;
                break;
            // case 'latest':
            //     url = 'https://api.themoviedb.org/3/movie/latest' + '?api_key=' + tmdbApiKey + '&language=fr-FR&page=' + page;
            //     break;
            case 'now_playing':
                url = 'https://api.themoviedb.org/3/movie/now_playing' + '?api_key=' + tmdbApiKey + '&language=fr-FR&page=' + page;
                break;
            case 'top_rated':
                url = 'https://api.themoviedb.org/3/movie/top_rated' + '?api_key=' + tmdbApiKey + '&language=fr-FR&page=' + page;
                break;
            case 'upcoming':
                url = 'https://api.themoviedb.org/3/movie/upcoming' + '?api_key=' + tmdbApiKey + '&language=fr-FR&page=' + page;
                break;
            default :
                url = 'https://api.themoviedb.org/3/discover/movie' + '?api_key=' + tmdbApiKey + '&language=fr-FR&page=' + page + '&with_genres=' + genreWanted;
        }

        const options = {
            method: 'GET',
            uri: url,
            json: true
        };

        try {
            let results = await rp(options);

            // Get only wanted fields in tmdb api response
            results = results.results.map(movie => {

                const posterPath = movie.poster_path;
                const title = movie.title;
                const note = movie.vote_average;
                const video = movie.video;
                const id = movie.id;

                if (posterPath !== null && title !== null) {
                    return {posterPath: posterPath, title: title, note: note, video: video, id: id}
                } else {
                    return null
                }

            });

            // Removing tv shows without title or poster path
            results = results.filter(movie => movie !== null);

            res.send(results)
        }
        catch(error) {
            res.send(error)
        }
    });

    /**
     * Search a particular movie in TMDB database with title
     */
    app.get('/api/search_tmdb_movie', async (req, res) => {
        const title = req.query.title;

        const options = {
            method: 'GET',
            uri: searchMovieTmdbUrl + '?api_key=' + tmdbApiKey + '&language=fr-FR&query=' + encodeURI(title) + '&page=1&include_adult=false',
            json: true
        };

        try {
            let results = await rp(options);

            // Get only wanted fields in tmdb api response
            results = results.results.map(movie => {

                const posterPath = movie.poster_path;
                const title = movie.title;
                const note = movie.vote_average;
                const video = movie.video;
                const id = movie.id;

                if (posterPath !== null && title !== null) {
                    return {posterPath: posterPath, title: title, note: note, video: video, id: id}
                } else {
                    return null
                }

            });

            // Removing tv shows without title or poster path
            results = results.filter(movie => movie !== null);

            res.send(results)
        }
        catch(error) {
            res.send(error)
        }
    });

    /**
     * Get urls (from different providers) for a particular movie
     */
    app.post('/api/search_providers_movie', async (req, res) => {

        try {

            const results = await Movies.getUrls(req.body.title);

            res.send(results);
        } catch(error) {
            res.status(500).send({
                message: error
            })
        }

    });

    /**
     * Get available qualities for a particular movie
     */
    app.post('/api/search_qualities', async (req, res) => {

        try {
            res.send(await Movies.getQualities(req.body.wanted.url, req.body.title, req.body.provider));
        } catch(error) {
            res.status(500).send({
                message: error
            })
        }

    });

    /**
     * Start the download of a particular movie
     */
    app.post('/api/start_movie_download', async (req, res) => {

        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            await usersRef.child(user.uid).child('/movies').child(req.body.id).set({title: req.body.title, state: 'finding_links', id: req.body.id});
            Movies.startDownloadMovieTask(req.body.quality_wanted.url, req.body.title, req.body.provider, db);
            res.send({message: "Movie in progress"});
        } catch(error) {
            res.status(500).send({message: error});
        }
    });

};