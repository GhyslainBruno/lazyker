import React, { useState, useEffect } from 'react';
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import Close from "@material-ui/icons/Close";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Grid from "@material-ui/core/Grid";
import imageNotFound from "../../../assets/notfound.png";
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
import screenfull from "screenfull";
import {findDOMNode} from "react-dom";
import Slide from "@material-ui/core/Slide";
import * as auth from "../../../firebase/auth";
import Link from "react-router-dom/es/Link";
import Fab from '@material-ui/core/Fab';
import MovieTorrentsList from "./MovieTorrentsList";

const styles = {
    outlinedChip : {
        border: 'thin solid grey',
        backgroundColor: 'transparent',
        margin: '5px'
    }
};

/**
 * Transition used to display dialog (usefull ?)
 * @param props
 * @returns {*}
 * @constructor
 */
const Transition = (props) => {
    return <Slide direction="up" {...props} />;
};

/**
 * Usefull for react player
 * @param player
 */
const ref = player => {
    this.player = player
};

const MovieInfoDialog = props => {

    const [movieInfoLoading, setMovieInfoLoading] = useState(false);
    const [movieInfo, setMovieInfo] = useState(null);
    const [trailerPlaying, setTrailerPlaying] = useState(false);
    const [torrentsList, setTorrentsList] = useState(null);
    const [torrentsListFull, setTorrentsListFull] = useState(null);
    const [providersMovies, setProvidersMovies] = useState(null);
    const [qualities, setQualities] = useState(null);
    const [isInTorrentOrDdl, setIsInTorrentOrDdl] = useState(false);
    const [movieTitle, setMovieTitle] = useState(null);
    const [showInfoDialog, setShowInfoDialog] = useState(false);
    const [tmdbTitle, setTmdbTitle] = useState(null);

    /**
     * Clears all the torrents / ddl results
     */
    const clearTorrentsOrDdl = () => {
        setTorrentsList(null);
        setProvidersMovies(null);
    };

    /**
     * Start the download of a torrent file (in realdebrid)
     **/
    const downloadTorrentFile = async (torrent) => {
        setMovieInfoLoading(true);
        setMovieInfo(null);
        setTorrentsList(null);

        const { selectedMovie } = props;

        try {
            let response = await fetch('/api/torrents', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    url: torrent.url,
                    provider: torrent.provider,
                    title: movieTitle,
                    id: selectedMovie.id,
                })
            });

            response = await response.json();

            if (response.message !== 'ok') {
                props.displaySnackMessage('Error while downloading torrent file');
            } else {
                props.displaySnackMessage('Torrent added - check progress in downloads');
            }

            setMovieInfoLoading(false);

            setTimeout(() => {
                props.closeDialog();
            }, 2000);

        } catch(error) {
            props.displaySnackMessage('Error while downloading torrent file');
            setMovieInfoLoading(false);
            props.closeDialog();
        }
    };

    /**
     * Find available qualities for a particular ddl provider
     **/
    const findProviderQualities = async (title, qualityWanted, provider) => {
        // this.setState({providersMovies: null, movieInfoLoading: true});
        setProvidersMovies(null);
        setMovieInfoLoading(true);

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
            // this.setState({providersMovies: null, tmdbMovies: [], qualities: qualities.qualities, movieInfoLoading: false})
            setProvidersMovies(null);
            setQualities(qualities.qualities);
            setMovieInfoLoading(false);

        } catch(error) {
            props.closeDialog();
            props.displaySnackMessage('Error while getting qualities');
            // this.setState({movieInfoLoading: false})
            setMovieInfoLoading(false);
        }
    };

    /**
     * Start in full screen the movie trailer
     **/
    const startTrailer = () => {
        screenfull.request(findDOMNode(this.player));
        // this.setState({trailerPlaying: true});
        setTrailerPlaying(true);
    };

    /**
     * Get a list of all torrents available
     **/
    const getTorrentsList = async movie => {
        setMovieInfoLoading(true);
        setMovieInfo(null);
        setIsInTorrentOrDdl(true);

        try {
            let response = await fetch('/api/torrents?title=' + movie.original_title, {
                method: 'GET'
            });

            const torrents = await response.json();

            // const torrents = [{
            //     'provider': 'ygg',
            //     'torrents': [
            //         {
            //             completed: "64",
            //             leech: "0",
            //             provider: "ygg",
            //             seed: "10",
            //             size: "266.95Mo",
            //             title: "Avengers Infinity War (2018) MULTi VFQ 1080p BluRay REMUX AVC DTS.GHT (Avengers : La guerre de l'infini) vf 4k ac3",
            //             url: "https://www2.yggtorrent.ch/torrent/audio/musique/233399-alan+silvestri+avengers+infinity+war+original+motion+picture+soundtrack+2018web+mp3+320kbps"
            //         }, {
            //             completed: "35",
            //             leech: "0",
            //             provider: "ygg",
            //             seed: "9",
            //             size: "592.12Mo",
            //             title: "Alan Silvestri – Avengers: Infinity War (Original Motion Picture Soundtrack) (2018)(web.flac.16bit) 720p ",
            //             url: "https://www2.yggtorrent.ch/torrent/audio/musique/233400-alan+silvestri+avengers+infinity+war+original+motion+picture+soundtrack+2018web+flac+16bit"
            //         }, {
            //             completed: "747",
            //             leech: "1",
            //             provider: "ygg",
            //             seed: "134",
            //             size: "1.73Go",
            //             title: "Avengers Infinity War (2018) French AAC BluRay 720p x264.GHT (Avengers:  La guerre de l'infini) vfq ac3 aac vf 1080p 4k uhd ",
            //             url: "https://www2.yggtorrent.ch/torrent/film-video/film/295275-avengers+infinity+war+2018+french+aac+bluray+720p+x264+ght+avengers+la+guerre+de+linfini"
            //         }
            //     ]
            // }];

            const torrentsTaggued = torrents[0].torrents.map(torrent => {

                torrent.tags = {};

                torrent.tags.multi = !!torrent.title.match(/multi/mi);
                torrent.tags.french = !!torrent.title.match(/french/mi);
                torrent.tags.vo = !!torrent.title.match(/vo/mi);
                torrent.tags.aac = !!torrent.title.match(/aac|ac3/mi);
                torrent.tags.dts = !!torrent.title.match(/dts/mi);
                torrent.tags.fullHd= !!torrent.title.match(/1080p/mi);
                torrent.tags.hd = !!torrent.title.match(/720p/mi);
                torrent.tags.h264 = !!torrent.title.match(/x264|h264/mi);
                torrent.tags.h265 = !!torrent.title.match(/x265|h265/mi);
                // torrent.bluray = !!torrent.title.match(/bluray/mi);
                torrent.tags.vfq = !!torrent.title.match(/vfq/mi);
                torrent.tags.hdlight = !!torrent.title.match(/hdlight/mi);
                // torrent.ac3 = !!torrent.title.match(/ac3/mi);
                torrent.tags.vostfr = !!torrent.title.match(/stfr/mi);
                torrent.tags.bdrip = !!torrent.title.match(/bdrip/mi);
                torrent.tags.uhd = !!torrent.title.match(/2160p|4k|uhd/mi);
                torrent.tags.threeD = !!torrent.title.match(/3d/mi);
                torrent.tags.vf = !!torrent.title.match(/vf/mi);

                torrent.isDisplayed = true;

                return torrent;
            });

            const torrentsTagguedToReturn = [];

            torrentsTagguedToReturn.push({
                torrents : torrentsTaggued,
                provider: 'ygg'
            });

            setMovieInfoLoading(false);
            setTorrentsListFull(torrentsTagguedToReturn);
            setTorrentsList(torrentsTagguedToReturn)
        } catch(error) {
            props.displaySnackMessage('Error while getting qualities');
            setMovieInfoLoading(false);
        }
    };

    /**
     * Search movies in ddl providers
     **/
    const searchProvidersMovie = async title => {

        window.removeEventListener('scroll', this.handleOnScroll);
        // this.setState({movieInfoLoading: true, movieInfo: null, isInTorrentOrDdl: true});
        setMovieInfoLoading(true);
        setMovieInfo(null);
        setIsInTorrentOrDdl(true);

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
                // this.setState({providersMovies: providersMovies, tmdbTitle: title, movieInfoLoading: false})
                setProvidersMovies(providersMovies);
                setMovieInfoLoading(false);
                setTmdbTitle(title);
            } else {
                props.closeDialog();
                props.displaySnackMessage('Providers error');
                // this.setState({movieInfoLoading: false})
                setMovieInfoLoading(false);
            }

        } catch (error) {
            props.closeDialog();
            props.displaySnackMessage('Providers error');
            // this.setState({movieInfoLoading: false})
            setMovieInfoLoading(false);
        }
    };

    useEffect(() => {
        getMovieInfo(props.selectedMovie);
        setShowInfoDialog(props.showInfoDialog);
    }, []);

    /**
     * Getting movie info
     **/
    const getMovieInfo = async movie => {
        // this.setState({movieInfoLoading: true, torrentsList: null, providersMovies: null, isInTorrentOrDdl: false, qualities: null});
        setMovieInfoLoading(true);
        setTorrentsList(null);
        setProvidersMovies(null);
        setIsInTorrentOrDdl(false);
        setQualities(null);

        try {
            let movieInfo = await fetch('/api/movie_info?id=' + movie.id);
            movieInfo =  await movieInfo.json();

            if (!movieInfo.error) {
                // this.setState({movieInfo: movieInfo, movieInfoLoading: false, movieTitle: movieInfo.title});
                setMovieInfo(movieInfo);
                setMovieTitle(movieInfo.title);
            } else {
                props.displaySnackMessage('Error getting infos');
                // this.setState({movieInfo: null, movieInfoLoading: false});
                setMovieInfo(null);
            }
            setMovieInfoLoading(false);

        } catch(error) {
            props.displaySnackMessage('Error getting infos');
        }
    };

    /**
     * Starts the download of a particular quality, for a particular movie, using a particular provider
     **/
    const startDownload = async (movie, qualityWanted) => {
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

            props.closeDialog();
            props.displaySnackMessage('Added - check Downloads for status');
            // this.setState({providersMovies: null, qualities: null});
            setProvidersMovies(null);
            setQualities(null);
        } catch (error) {
            props.displaySnackMessage('Error while starting the download');
        }

    };

    /**
     * Close the dialog and clears data
     **/
    const closeDialog = () => {
        // this.setState({torrentsList: null, isInTorrentOrDdl: false});
        setTorrentsList(null);
        setIsInTorrentOrDdl(false);
        props.closeDialog();
    };

    // TODO: finish ddl parts + extract some more components
    return (
        <Dialog
            fullScreen
            TransitionComponent={Transition}
            open={showInfoDialog}
            onClose={() => closeDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">

            <DialogContent style={{padding: '0'}}>

                <Fab
                    size="small"
                    style={{
                        position: 'absolute',
                        zIndex: '1',
                        right: '5px',
                        top: '5px',
                        backgroundColor: '#757575',
                        color: "white"
                    }}
                    component={Link}
                    to={{pathname: '/movies', search: `?genre=${props.genreSelected.id}`}}>
                    <Close/>
                </Fab>


                <Button
                    onClick={() => getMovieInfo(props.selectedMovie)}
                    variant="fab"
                    mini
                    style={isInTorrentOrDdl ? {margin: '5px', position: 'fixed', zIndex: '2', backgroundColor: '#757575', color: "white", left: '0'} : {display: 'none'}}>
                    <ArrowBack />
                </Button>

                <div style={{textAlign: 'center'}}>

                    <div style={movieInfoLoading ? {position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'} : {display: 'none'}}>
                        <CircularProgress/>
                    </div>

                    {/*Torrents list*/}
                    {torrentsList !== null ?
                        <MovieTorrentsList
                            providers={torrentsListFull}
                            downloadTorrent={downloadTorrentFile}
                            />
                        :
                        null
                    }


                    {/*URL for ddl*/}
                    {providersMovies !== undefined ?
                        providersMovies !== null  ?
                            providersMovies[0].results.length > 0 ?
                                <div>
                                    {providersMovies.map(provider => {
                                        return (
                                            <div className="movieInfoDialog">
                                                <h2>{provider.provider}</h2>
                                                <Grid container spacing={0}>
                                                    {
                                                        provider.results.map(movie => {
                                                            movie.validImage = movie.image.match(/^http/g) === null ? imageNotFound : movie.image;
                                                            return (
                                                                <Grid item xs={4} style={{padding: '6px'}}>
                                                                    <Card>
                                                                        <CardMedia
                                                                            onClick={() => findProviderQualities(movie.title, movie, provider.provider)}
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
                                                            )})
                                                    }
                                                </Grid>
                                            </div>
                                        )
                                    })
                                    }
                                </div>
                                :
                                <div style={{paddingTop: '20rem', fontSize: '0.9rem', color: 'grey'}}>no results found</div>
                            :
                            null
                        :
                        null
                    }

                    {/* Movie Info */}
                    {movieInfo !== null ?

                        <div className="movieInfoDialog">

                            <div
                                className="backdropMovieInfoDialog"
                                style={{
                                    position: 'relative',
                                    background: `linear-gradient(transparent, transparent, transparent, transparent, black), url(${'https://image.tmdb.org/t/p/w780' + movieInfo.backdrop_path})`}}>

                                <Chip
                                    clickable="true"
                                    onClick={() => startTrailer()}
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
                                    <img className="dataMovieInfo" style={{width: '100%'}} src={'https://image.tmdb.org/t/p/w500' + movieInfo.poster_path}/>
                                </div>

                                <div style={{width: '70%', paddingLeft: '30px', textAlign: 'left'}}>
                                    <h4 style={{color: 'white', fontSize: '1.4rem', marginTop: '15px', marginBottom: '15px'}}>{movieInfo.original_title}</h4>
                                    <p style={{margin: '5px'}}>{movieInfo.release_date}</p>
                                    <p style={{margin: '5px'}}>{movieInfo.runtime} min</p>
                                    <p style={{margin: '5px'}}><Star style={{fontSize: '18'}}/> {movieInfo.vote_average}</p>
                                </div>
                            </div>

                            <div style={{display: 'inline-flex', marginTop: '10px', marginBottom: '10px'}}>
                                <div>
                                    <Chip
                                        clickable="true"
                                        onClick={() => getTorrentsList(movieInfo)}
                                        avatar={
                                            <Avatar
                                                style={{backgroundColor: "#9b0101"}}>
                                                <Download />
                                            </Avatar>
                                        }
                                        label="Torrents Download"
                                        style={{margin: '5px', position: 'relative', top: '50%', backgroundColor: "red"}}/>
                                </div>

                                {/* DDL part hidden */}
                                {/*<div>*/}
                                {/*<Chip*/}
                                {/*clickable="true"*/}
                                {/*// onClick={() => this.searchProvidersMovie(this.state.movieInfo.title)}*/}
                                {/*onClick={() => this.props.displaySnackMessage('Not ready yet')}*/}
                                {/*avatar={*/}
                                {/*<Avatar*/}
                                {/*style={{backgroundColor: "#9b0101"}}>*/}
                                {/*<Download />*/}
                                {/*</Avatar>*/}
                                {/*}*/}
                                {/*label="Direct Download"*/}
                                {/*style={{margin: '5px', position: 'relative', top: '50%', backgroundColor: "red"}}/>*/}
                                {/*</div>*/}
                            </div>


                            <div>
                                <p className="dataMovieInfo" style={{textAlign: 'justify'}}>{movieInfo.overview}</p>
                            </div>

                            <div style={{marginBottom: '15px'}}>
                                <p className="dataMovieInfo" style={{textAlign: 'left'}}>Genre(s) :</p>
                                {movieInfo.genres.map(genre => {
                                    return (
                                        <Chip label={genre.name} style={styles.outlinedChip} />
                                    )
                                })}
                            </div>

                            <ReactPlayer ref={ref} url={movieInfo.trailer} playing={trailerPlaying} controls={true} width="100%" />

                        </div>

                        :

                        null

                    }

                    {/* Qualities */}
                    {qualities !== null ? qualities.length > 0 ?

                        <div className="movieInfoDialog">

                            <h2>Available qualities</h2>

                            <List component="nav">

                                {qualities.map(quality => {
                                    return (
                                        <Paper elevation={1} style={{margin: '5px', backgroundColor: '#757575'}}>
                                            <ListItem button>
                                                <ListItemText primary={quality.quality + quality.lang} onClick={() => startDownload(props.selectedMovie, quality)}/>
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
    )
};

export default MovieInfoDialog;
