import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import Close from "@material-ui/icons/Close";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Grid from "@material-ui/core/Grid";
import imageNotFound from "../../assets/notfound.png";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
import Play from "@material-ui/icons/PlayArrow";
import ArrowBack from '@material-ui/icons/ArrowBack';
import Star from "@material-ui/icons/Star";
import Download from "@material-ui/icons/GetApp";
import ReactPlayer from "react-player";
import Dialog from "@material-ui/core/Dialog";
import React from "react";
import screenfull from "screenfull";
import {findDOMNode} from "react-dom";
import Slide from "@material-ui/core/Slide";
import * as auth from "../../firebase/auth";

const styles = {
    outlinedChip : {
        border: 'thin solid grey',
        backgroundColor: 'transparent',
        margin: '5px'
    }
};

class MovieInfoDialog extends React.Component {

    constructor(props)
    {
        super(props);
        this.state = {
            movieInfoLoading: false,
            movieInfo: null,
            trailerPlaying: false,
            torrentsList: null,
            providersMovies: null,
            qualities: null,
            isInTorrentOrDdl: false
        };
    }

    /**
     * Clears all the torrents / DDL results
     */
    clearTorrentsOrDdl = () => {
        this.setState({
            torrentsList: null,
            providersmovies: null
        })
    };

    // Start the download of a torrent file (in realdebrid)
    downloadTorrentFile = async (torrent) => {
        this.setState({movieInfoLoading: true, movieInfo: null, torrentsList: null});

        try {
            let response = await fetch('/api/torrents', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    url: torrent.url
                })
            });

            response = await response.json();

            if (response.message !== 'ok') {
                this.props.displaySnackMessage('Error while downloading torrent file');
            } else {
                this.props.displaySnackMessage('Torrent added - check status in downloads');
            }

            this.setState({movieInfoLoading: false});
            this.props.closeDialog();

        } catch(error) {
            this.props.displaySnackMessage('Error while downloading torrent file');
            this.setState({movieInfoLoading: false});
            this.props.closeDialog();
        }
    };

    // Find available qualities for a particular DDL provider
    findProviderQualities = async (title, qualityWanted, provider) => {
        this.setState({providersMovies: null, movieInfoLoading: true});

        try {
            let response = await fetch('/api/search_qualities', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    wanted: qualityWanted,
                    provider: provider
                })
            });

            const qualities = await response.json();
            this.setState({providersMovies: null, tmdbMovies: [], qualities: qualities.qualities, movieInfoLoading: false})

        } catch(error) {
            this.props.closeDialog();
            this.props.displaySnackMessage('Error while getting qualities');
            this.setState({movieInfoLoading: false})
        }
    };

    // Start in full screen the movie trailer
    startTrailer = () => {
        screenfull.request(findDOMNode(this.player));
        this.setState({trailerPlaying: true});
    };

    // Get a list of all torrents available
    getTorrentsList = async (movie) => {
        this.setState({movieInfoLoading: true, movieInfo: null, isInTorrentOrDdl: true});
        try {
            let response = await fetch('/api/torrents?title=' + movie.title, {
                method: 'GET'
            });

            const torrents = await response.json();

            // console.log('foo')
            this.setState({movieInfoLoading: false, torrentsList: torrents});
        } catch(error) {
            this.props.displaySnackMessage('Error while getting qualities');
            this.setState({loading: false})
        }
    };

    // Search movies in DDL providers
    searchProvidersMovie = async (title) => {

        window.removeEventListener('scroll', this.handleOnScroll);
        this.setState({movieInfoLoading: true, movieInfo: null, isInTorrentOrDdl: true});
        try {
            let response = await fetch('/api/search_providers_movie', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title
                })
            });

            const providersMovies = await response.json();

            // If .message exists --> error (TODO: find why)
            if (!providersMovies.message) {
                this.setState({providersMovies: providersMovies, tmdbTitle: title, movieInfoLoading: false})
            } else {
                this.props.closeDialog();
                this.props.displaySnackMessage('Providers error');
                this.setState({movieInfoLoading: false})
            }

        } catch (error) {
            this.props.closeDialog();
            this.props.displaySnackMessage('Providers error');
            this.setState({movieInfoLoading: false})
        }
    };

    // Get movie info at rendering
    componentDidMount() {
        this.setState({showInfoDialog: this.props.showInfoDialog});
        this.getMovieInfo(this.props.selectedMovie);
    };

    // Transition used to display dialog (usefull ?)
    Transition = (props) => {
        return <Slide direction="up" {...props} />;
    };

    // Usefull for react player
    ref = player => {
        this.player = player
    };

    // Getting movie info
    getMovieInfo = async (movie) => {
        this.setState({movieInfoLoading: true, torrentsList: null, providersMovies: null, isInTorrentOrDdl: false});
        try {
            let movieInfo = await fetch('/api/movie_info?id=' + movie.id);
            movieInfo =  await movieInfo.json();

            if (!movieInfo.error) {
                this.setState({movieInfo: movieInfo, movieInfoLoading: false});
            } else {
                this.props.displaySnackMessage('Error getting infos');
                this.setState({movieInfo: null, movieInfoLoading: false});
            }

        } catch(error) {
            this.props.displaySnackMessage('Error getting infos');
        }
    };

    // Starts the download of a particular quality, for a particular movie, using a particular provider
    startDownload = async (movie, qualityWanted) => {
        try {
            fetch('/api/start_movie_download', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    title: movie.title,
                    quality_wanted: qualityWanted,
                    provider: qualityWanted.provider,
                    id: movie.id
                })
            });

            this.props.closeDialog();
            this.props.displaySnackMessage('Added - check Downloads for status');
            this.setState({providersMovies: null, qualities: null});
        } catch (error) {
            this.props.displaySnackMessage('Error while starting the download');
        }

    };

    // Close the dialog and clears data
    closeDialog = () => {
        this.setState({torrentsList: null, isInTorrentOrDdl: false});
        this.props.closeDialog();
    };

    // TODO: finish ddl parts + extract some more components
    render() {

        const { showInfoDialog, selectedMovie, closeDialog } = this.props;

        return (

            <div>

                <Dialog
                    fullScreen
                    TransitionComponent={this.Transition}
                    open={showInfoDialog}
                    onClose={() => this.closeDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">

                    <DialogContent style={{padding: '0'}}>

                        <Button
                            onClick={() => closeDialog()}
                            variant="fab"
                            mini
                            style={{margin: '5px', position: 'fixed', zIndex: '2', backgroundColor: '#757575', color: "white", right: '0'}}>
                            <Close />
                        </Button>

                        <Button
                            onClick={() => this.getMovieInfo(this.props.selectedMovie)}
                            variant="fab"
                            mini
                            style={this.state.isInTorrentOrDdl ? {margin: '5px', position: 'fixed', zIndex: '2', backgroundColor: '#757575', color: "white", left: '0'} : {display: 'none'}}>
                            <ArrowBack />
                        </Button>

                        <div style={{textAlign: 'center'}}>

                            <div style={this.state.movieInfoLoading ? {display: 'inline-block', paddingTop: '22rem'} : {display: 'none'}}>
                                <CircularProgress/>
                            </div>

                            {/*Torrents list*/}
                            {this.state.torrentsList !== null ?
                                this.state.torrentsList.length > 0 ?
                                <div className="movieInfoDialog">

                                    <h2>Torrents</h2>

                                    <List component="nav">

                                        {this.state.torrentsList.map(torrent => {
                                            return (
                                                <Paper elevation={1} style={{margin: '5px', backgroundColor: '#757575'}}>
                                                    <ListItem button style={{overflow: 'hidden'}}>
                                                        <ListItemText primary={torrent.title} onClick={() => this.downloadTorrentFile(torrent)}/>
                                                    </ListItem>
                                                </Paper>

                                            )
                                        })}


                                    </List>
                                </div>
                                :
                                    <div style={{paddingTop: '20rem', fontSize: '0.9rem', color: 'grey'}}>no torrents found</div>
                                :
                                null
                            }


                            {/*URL for DDL*/}
                            {this.state.providersMovies !== undefined ?
                                this.state.providersMovies !== null  ?
                                    this.state.providersMovies.length > 0 ?
                                        <div>
                                            {this.state.providersMovies.map(provider => {
                                                return (
                                                    <div className="movieInfoDialog">
                                                        <h2>{provider.provider}</h2>
                                                        <Grid container spacing={0}>
                                                            {provider.results.map(movie => {
                                                                movie.validImage = movie.image.match(/^http/g) === null ? imageNotFound : movie.image;
                                                                return (
                                                                    <Grid item xs={4} style={{padding: '6px'}}>
                                                                        <Card>
                                                                            <CardMedia
                                                                                onClick={() => this.findProviderQualities(movie.title, movie, provider.provider)}
                                                                                style={{paddingTop: '150%'}}
                                                                                image={movie.validImage}
                                                                                title={movie.title}
                                                                            />
                                                                            <CardContent style={{padding: '5px', backgroundColor: '#757575'}}>
                                                                                <Typography gutterBottom component="p" style={{
                                                                                    overflow: 'hidden',
                                                                                    lineHeight: '1.5em',
                                                                                    textOverflow: 'ellipsis',
                                                                                    height: '3em'
                                                                                }}>
                                                                                    {movie.title}</Typography>
                                                                            </CardContent>
                                                                        </Card>
                                                                    </Grid>
                                                                )
                                                            })}</Grid>
                                                    </div>
                                                )
                                            })
                                            }
                                        </div>
                                        :
                                        <div style={{padding: "30px", color: "grey"}}>no results found</div>
                                    :
                                    null
                                :
                                null
                            }

                            {/* Movie Info */}
                            {this.state.movieInfo !== null ?

                                <div className="movieInfoDialog">

                                    <div
                                        className="backdropMovieInfoDialog"
                                        style={{
                                            position: 'relative',
                                            // backgroundImage:`url(${'https://image.tmdb.org/t/p/w780' + this.state.movieInfo.backdrop_path})`,
                                            background: `linear-gradient(transparent, transparent, transparent, transparent, black), url(${'https://image.tmdb.org/t/p/w780' + this.state.movieInfo.backdrop_path})`}}>

                                        <Chip
                                            clickable="true"
                                            onClick={() => this.startTrailer()}
                                            avatar={
                                                <Avatar>
                                                    <Play />
                                                </Avatar>
                                            }
                                            label="Trailer"
                                            style={{margin: '0', position: 'relative', top: '50%'}}/>

                                    </div>

                                    <div style={{display: 'flex'}}>
                                        <div style={{width: '30%'}}>
                                            <img className="dataMovieInfo" style={{width: '100%'}} src={'https://image.tmdb.org/t/p/w500' + this.state.movieInfo.poster_path}/>
                                        </div>

                                        <div style={{width: '70%', paddingLeft: '30px', textAlign: 'left'}}>
                                            <h4 style={{color: 'white', fontSize: '1.4rem', marginTop: '15px', marginBottom: '15px'}}>{this.state.movieInfo.title}</h4>
                                            <p style={{margin: '5px'}}>{this.state.movieInfo.release_date}</p>
                                            <p style={{margin: '5px'}}>{this.state.movieInfo.runtime} min</p>
                                            <p style={{margin: '5px'}}><Star style={{fontSize: '18'}}/> {this.state.movieInfo.vote_average}</p>
                                        </div>
                                    </div>

                                    <div style={{display: 'inline-flex', marginTop: '10px', marginBottom: '10px'}}>
                                        <div>
                                            <Chip
                                                clickable="true"
                                                onClick={() => this.getTorrentsList(this.state.movieInfo)}
                                                avatar={
                                                    <Avatar
                                                        style={{backgroundColor: "#9b0101"}}>
                                                        <Download />
                                                    </Avatar>
                                                }
                                                label="Torrents Download"
                                                style={{margin: '5px', position: 'relative', top: '50%', backgroundColor: "red"}}/>
                                        </div>

                                        <div>
                                            <Chip
                                                clickable="true"
                                                onClick={() => this.searchProvidersMovie(this.state.movieInfo.title)}
                                                // onClick={() => this.props.displaySnackMessage('Not ready yet')}

                                                avatar={
                                                    <Avatar
                                                        style={{backgroundColor: "#9b0101"}}>
                                                        <Download />
                                                    </Avatar>
                                                }
                                                label="Direct Download"
                                                style={{margin: '5px', position: 'relative', top: '50%', backgroundColor: "red"}}/>
                                        </div>
                                    </div>


                                    <div>
                                        <p className="dataMovieInfo" style={{textAlign: 'justify'}}>{this.state.movieInfo.overview}</p>
                                    </div>

                                    <div style={{marginBottom: '15px'}}>
                                        <p className="dataMovieInfo" style={{textAlign: 'left'}}>Genre(s) :</p>
                                        {this.state.movieInfo.genres.map(genre => {
                                            return (
                                                <Chip label={genre.name} style={styles.outlinedChip} />
                                            )
                                        })}
                                    </div>

                                    <ReactPlayer ref={this.ref} url={this.state.movieInfo.trailer} playing={this.state.trailerPlaying} controls={true} width="100%" />

                                </div>

                                :

                                null

                            }

                            {/* Qualities */}
                            {this.state.qualities !== null ? this.state.qualities.length > 0 ?

                            <div className="movieInfoDialog">

                                <h2>Available qualities</h2>

                                <List component="nav">

                                    {this.state.qualities.map(quality => {
                                        return (
                                            <Paper elevation={1} style={{margin: '5px', backgroundColor: '#757575'}}>
                                                <ListItem button>
                                                    <ListItemText primary={quality.quality + quality.lang} onClick={() => this.startDownload(this.props.selectedMovie, quality)}/>
                                                </ListItem>
                                            </Paper>

                                        )
                                    })}
                                    </List>
                            </div>

                                :

                                <div style={{padding: "30px", color: "grey"}}>no results found</div>

                                :

                                null
                            }

                            </div>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }
}

export default MovieInfoDialog;