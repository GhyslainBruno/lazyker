import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Input from '@material-ui/core/Input';
import Search from '@material-ui/icons/Search';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import Star from '@material-ui/icons/Star';
import CircularProgress from '@material-ui/core/CircularProgress';
import Close from '@material-ui/icons/Close';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import MovieInfoDialog from './movies/MovieInfoDialog';

const styles = {

    outlinedChip : {
        border: 'thin solid grey',
        backgroundColor: 'transparent',
        margin: '3px'
    },
    selectedChip: {
        border: 'none',
        backgroundColor: '#424242',
        margin: '3px'
    }

};

class Movies extends Component {

    constructor(props)
    {
        super(props);
        this.state = {
            isInSearchView: null,
            tmdbMovies: null,
            movieTitleToSearch: null,
            tmdbTitle: null,
            selectedMovie: null,
            snack: null,
            loading: false,
            hasMoreItems: false,
            pageNumber: 1,
            infiniteLoading: false,
            showSearchBar: true,
            oldScroll: 0,
            movieGenres: null,
            movieGenresLoading: true,
            moviesGenre: '',
            showInfoDialog: false,
        };

        props.changeNavigation('movies');

    }

    cleanSearch = async () => {
        window.addEventListener('scroll', this.handleOnScroll);
        await this.setState({
                tmdbMovies: [],
                isInSearchView: false,
                providersMovies: null,
                qualities: null,
                movieTitleToSearch: '',
                pageNumber: 1,
                movieGenres: null,
                moviesGenre: {name: 'Popular'}
        });
        await this.getMovies();
    };

    onEnterKeyPressed = (event) => {
        if (event.keyCode || event.which === 13) {
            this.searchMovie()
        }
    };

    searchMovie = () =>{
        window.removeEventListener('scroll', this.handleOnScroll);

        this.setState({tmdbMovies: [], isInSearchView: true, providersMovies: null, qualities: null, loading: true, movieGenres: null});

        const movieTitle = document.getElementById('movie_title_to_search').value;

        fetch('/api/search_tmdb_movie?title=' + movieTitle)
            .then(response => {
                return response.json()
            })
            .then(data => {
                this.setState({tmdbMovies: data, loading: false});
            })
            .catch(error => {
                this.setState({snack: true, snackBarMessage: 'Error while searching movie', loading: false, tmdbMovies: null})
            })

    };

    updateMovieTitleToSearch = (evt) => {
        this.setState({
            movieTitleToSearch: evt.target.value
        });
    };

    // startDownload = async (title, qualityWanted) => {
    //     let response = fetch('/api/start_movie_download', {
    //         method: 'POST',
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             title: title,
    //             quality_wanted: qualityWanted,
    //             provider: qualityWanted.provider
    //         })
    //     });
    //
    //     this.setState({providersMovies: null, tmdbMovies: null, qualities: null, snackBarMessage: 'Added - check Downloads for status', snack: true, pageNumber: 1});
    //     this.getMovies();
    // };

    getMovies = async () => {
        const page = this.state.pageNumber;
        this.setState({isInSearchView: false, providersMovies: null, qualities: null, infiniteLoading: true});

        try {

            let genre  = '';

            switch (this.state.moviesGenre.name) {
                case 'Popular':
                    genre = 'popular';
                    break;
                // case 'Latest':
                //     genre = 'latest';
                //     break;
                case 'Now Playing':
                    genre = 'now_playing';
                    break;
                case 'Top Rated':
                    genre = 'top_rated';
                    break;
                case 'Upcoming':
                    genre = 'upcoming';
                    break;
                default :
                    genre = this.state.moviesGenre.id;
            }

            let movies = await fetch('/api/movies?page=' + page + '&genre=' + genre);
            movies =  await movies.json();

            let tmdbMovies = [];

            if (this.state.tmdbMovies === null) {
                tmdbMovies = movies;
            } else {
                tmdbMovies = this.state.tmdbMovies.concat(movies);
            }

            tmdbMovies = tmdbMovies.filter(el => el !== null);

            this.setState({tmdbMovies: tmdbMovies, pageNumber: page + 1, infiniteLoading: false});

        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error getting movies', infiniteLoading: false, tmdbMovies: null})
        }
    };

    componentDidMount() {

        this.setState({moviesGenre: {name: 'Popular'}}, () => {
            window.addEventListener('scroll', this.handleOnScroll);

            this.getMovies();
        });

    }

    componentWillUnmount = () => {
        window.removeEventListener('scroll', this.handleOnScroll);
    };

    clearTitle = () => {
        this.setState({movieTitleToSearch: ''})
    };

    showDialogErrorProviders = () => {
        this.setState({snack: true, snackBarMessage: 'Providers error', loading: false})
    };


    handleOnScroll = (event) => {
        // http://stackoverflow.com/questions/9439725/javascript-how-to-detect-if-browser-window-is-scrolled-to-bottom
        const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
        const scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight || window.innerHeight;
        const scrolledToBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

        // const scrollY = window.scrollY;
        //
        // this.checkScrollDirection(scrollY);

        if (scrolledToBottom) {
            this.getMovies();
        }
    };

    checkScrollDirection = (scrollY) => {
        // To know if scrollin down or up
        if (this.state.oldScroll > scrollY) {
            console.log("up");
            // this.setState({showSearchBar: true});
        } else {
            console.log("down");
            // this.setState({showSearchBar: false});
        }

        this.setState({oldScroll: scrollY})

    };

    getMoviesGenres = async () => {
        try {

            this.setState({movieGenres: [], movieGenresLoading: true});

            let movieGenres = await fetch('/api/movies_genres?genre='+ this.state.moviesGenre);
            movieGenres =  await movieGenres.json();

            this.setState({movieGenres: movieGenres, movieGenresLoading: false});

        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error getting genres', movieGenresLoading: false, movieGenres: null})
        }
    };

    searchBarLostFocus = (event) => {
        if (event.relatedTarget === null) {
            this.setState({movieGenres: null});
        } else if (event.relatedTarget.className.match("movieGenre")) {
            console.log('not cleaning')
        } else {
            this.setState({movieGenres: null});
        }
    };

    searchMovieGenre = movieGenre => {
        this.setState({movieGenres: null, moviesGenre: movieGenre, tmdbMovies: null, pageNumber: 1}, () => {
            this.getMovies();
        });
    };

    closeInfoDialog = () => {
        this.setState({showInfoDialog: false});
    };

    displayMovieInfo = (movie) => {
        this.setState({showInfoDialog: true, movieInfoLoading: true, movieInfo: null, selectedMovie: movie});
    };

    displaySnackMessage = message => {
        this.setState({snack: true, snackBarMessage: message})
    };


    render() {

        return (
            <div style={{textAlign: 'center'}}>

                {/* Movie dialog info extracted */}
                {this.state.showInfoDialog ?
                    <MovieInfoDialog
                        selectedMovie={this.state.selectedMovie}
                        showInfoDialog={this.state.showInfoDialog}
                        closeDialog={this.closeInfoDialog}
                        displaySnackMessage={this.displaySnackMessage}
                    />
                :
                    null
                }


                <Snackbar
                    open={this.state.snack}
                    onClose={() => this.setState({snack: false})}
                    autoHideDuration={2000}
                    message={this.state.snackBarMessage}
                />



                <div style={{flexGrow: '1'}}>
                    <AppBar
                        position="static"
                        color="default">
                        <Toolbar>
                            <IconButton style={this.state.isInSearchView ? {visibility: 'visible', marginRight: '16px'} : {visibility: 'hidden', marginRight: '16px'}}>
                                <ArrowBack onClick={this.cleanSearch}/>
                            </IconButton>

                            <Input
                                id="movie_title_to_search"
                                value={this.state.movieTitleToSearch}
                                onClick={this.getMoviesGenres}
                                placeholder="Movie title"
                                onChange={evt => this.updateMovieTitleToSearch(evt)}
                                onBlur={evt => this.searchBarLostFocus(evt)}
                                disableUnderline={true}
                                style={{width: '80%'}}
                                onKeyPress={(event) => {this.onEnterKeyPressed(event)}}
                                onblur={() => alert('foo')}
                            />

                            <IconButton>
                                {this.state.movieTitleToSearch !== null && this.state.movieTitleToSearch !== '' ?
                                    <Close onClick={this.clearTitle}/>
                                    :
                                    <Search onClick={this.state.movieTitleToSearch !== null && this.state.movieTitleToSearch !== '' ? this.searchMovie : null}/>
                                }
                            </IconButton>

                        </Toolbar>
                    </AppBar>

                    <Paper elevation={1} style={this.state.movieGenres !== null ? {padding: '5px'} : {display: 'none'}}>

                        <CircularProgress style={this.state.movieGenresLoading ? {display: 'inline-block'} : {display: 'none'}}/>

                        {
                            this.state.movieGenres !== null ? this.state.movieGenres.map(movieGenre => {
                                return (
                                    <Chip label={movieGenre.name} style={styles.outlinedChip} className="movieGenre" clickable="true" onClick={() => this.searchMovieGenre(movieGenre)} />
                                    )
                            })
                                :
                                null
                        }

                    </Paper>

                    <div style={{paddingTop: '10px', paddingBottom: '10px'}}>
                        <Chip label="Now Playing" style={this.state.moviesGenre.name === 'Now Playing' ? styles.selectedChip : styles.outlinedChip} clickable="true" onClick={() => this.searchMovieGenre({name: "Now Playing"})}/>
                        <Chip label="Popular" style={this.state.moviesGenre.name === 'Popular' ? styles.selectedChip : styles.outlinedChip} clickable="true" onClick={() => this.searchMovieGenre({name: "Popular"})} />
                        <Chip label="Top Rated" style={this.state.moviesGenre.name === 'Top Rated' ? styles.selectedChip : styles.outlinedChip} clickable="true" onClick={() => this.searchMovieGenre({name: "Top Rated"})} />
                        <Chip label="Upcoming" style={this.state.moviesGenre.name === 'Upcoming' ? styles.selectedChip : styles.outlinedChip} clickable="true" onClick={() => this.searchMovieGenre({name: "Upcoming"})} />
                    </div>


                </div>


                <CircularProgress style={this.state.loading ? {display: 'inline-block', marginTop: '40px'} : {display: 'none'}}/>


                {this.state.tmdbMovies !== null ? this.state.tmdbMovies.length > 0 ?

                    <div>

                        {
                            this.state.moviesGenre.name !== 'Now Playing' &&
                            this.state.moviesGenre.name !== 'Popular' &&
                            this.state.moviesGenre.name !== 'Top Rated' &&
                            this.state.moviesGenre.name !== 'Upcoming' ?
                                <h2>{this.state.moviesGenre.name} movies</h2>
                                :
                                null
                        }

                        <Grid container spacing={0}>


                            {this.state.tmdbMovies.map(movie => {

                                return (

                                    <Grid item xs={4} style={{padding: '6px'}}>

                                        <Card>

                                            <CardMedia
                                                // onClick={() => this.searchProvidersMovie(movie.title)}
                                                onClick={() => this.displayMovieInfo(movie)}
                                                style={{paddingTop: '150%', cursor: 'pointer'}}
                                                image={"https://image.tmdb.org/t/p/w500" + movie.posterPath}
                                                title={movie.title}
                                                clickable="true"
                                            />

                                            {/*<CardActions style={{display: 'flex'}} disableActionSpacing>*/}
                                                {/*<Button style={{minWidth: '0', flex: '1'}}>*/}
                                                    {/*<Star style={{fontSize: '18'}}/>*/}
                                                    {/*{movie.note}*/}
                                                {/*</Button>*/}
                                            {/*</CardActions>*/}

                                            <CardContent>
                                                <div>
                                                    <Star style={{fontSize: '18', verticalAlign: 'bottom'}}/>
                                                    {movie.note}
                                                </div>


                                                {/*<Typography component="p">*/}
                                                    {/*Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging*/}
                                                    {/*across all continents except Antarctica*/}
                                                {/*</Typography>*/}
                                            </CardContent>

                                        </Card>
                                    </Grid>

                                )

                            })}

                        </Grid>

                        <CircularProgress style={this.state.infiniteLoading ? {display: 'inline-block', marginTop: '40px'} : {display: 'none'}}/>

                    </div>

                    :

                    <CircularProgress style={

                        this.state.loading ?

                            this.state.infiniteLoading ?

                                {display: 'none'}
                                :
                                {display: 'none'}

                            :
                            this.state.infiniteLoading ?

                                {display: 'inline-block', marginTop: '40px'}
                                :
                                {display: 'none'}}
                                      
                    />

                    :

                    <div>
                        <CircularProgress style={this.state.infiniteLoading ? {display: 'inline-block', marginTop: '40px'} : {display: 'none'}}/>
                        <div style={
                            this.state.loading ?

                                this.state.infiniteLoading ?

                                    {display: 'none'}
                                    :
                                    {display: 'none'}

                                :
                                this.state.infiniteLoading ?

                                    {display: 'none'}
                                    :
                                    {display: 'inline-block', padding: '30px', color: 'grey'}
                        }

                        >no results found</div>
                    </div>

                }


            </div>
        )
    }

}

export default Movies