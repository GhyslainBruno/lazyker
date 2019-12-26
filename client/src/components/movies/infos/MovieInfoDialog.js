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

const styles = {
    outlinedChip : {
        border: 'thin solid grey',
        backgroundColor: 'transparent',
        margin: '5px'
    },
    // Video quality
    multiChip: {
        border: 'thin solid #ffe317',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#ffe317'
    },
    multiChipFull: {
        border: 'thin solid #ffe317',
        backgroundColor: '#ffe317',
        opacity: '0.7',
        margin: '2px',
        // color: '#ffe317'
    },
    hdChip: {
        border: 'thin solid #1bd860',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#1bd860'
    },
    fullHdChip: {
        border: 'thin solid #c7c21d',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#c7c21d'
    },
    aacChip: {
        border: 'thin solid #1ebd97',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#1ebd97'
    },
    dtsChip: {
        border: 'thin solid #ff7858',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#ff7858'
    },
    frenchChip: {
        border: 'thin solid #01dcff',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#01dcff'
    },
    voChip: {
        border: 'thin solid #ac3fff',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#ac3fff'
    },
    h264: {
        border: 'thin solid #ffa489',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#ffa489'
    },
    h264Full: {
        border: 'thin solid #ffa489',
        backgroundColor: '#ffa489',
        opacity: '0.7',
        margin: '2px'
    },
    h265: {
        border: 'thin solid #d55e37',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#d55e37'
    },
    bluray: {
        border: 'thin solid #b4ff56',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#b4ff56'
    },
    blurayFull: {
        border: 'thin solid #b4ff56',
        backgroundColor: '#b4ff56',
        opacity: '0.7',
        margin: '2px'
    },
    vfq: {
        border: 'thin solid #d68bff',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#d68bff'
    },
    hdlight: {
        border: 'thin solid #6bff96',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#6bff96'
    },
    vostfr: {
        border: 'thin solid #5070ff',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#5070ff'
    },
    ac3: {
        border: 'thin solid #32ffa1',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#32ffa1'
    },
    bdrip: {
        border: 'thin solid #a9cb4b',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#a9cb4b'
    },
    uhd: {
        border: 'thin solid #ff631d',
        opacity: '0.7',
        backgroundColor: 'transparent',
        margin: '2px',
        color: '#ff631d'
    },
    vf: {
        border: 'thin solid #2f3dff',
        opacity: '0.7',
        backgroundColor: 'transparent',
        margin: '2px',
        color: '#2f3dff'
    },
    threeD: {
        border: 'thin solid #ac9826',
        opacity: '0.7',
        backgroundColor: 'transparent',
        margin: '2px',
        color: '#ac9826'
    }
};

// Transition used to display dialog (usefull ?)
const Transition = (props) => {
    return <Slide direction="up" {...props} />;
};

// Usefull for react player
const ref = player => {
    this.player = player
};

const MovieInfoDialog = props => {

    const [uhd, setUhd] = useState(false);
    const [fullHd, setFullHd] = useState(false);
    const [hd, setHd] = useState(false);
    const [multi, setMulti] = useState(false);
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

    // constructor(props)
    // {
    //     super(props);
    //     this.state = {
    //         uhd: false,
    //         fullHd: false,
    //         hd: false,
    //         movieInfoLoading: false,
    //         movieInfo: null,
    //         trailerPlaying: false,
    //         torrentsList: null,
    //         torrentsListFull: null,
    //         providersMovies: null,
    //         qualities: null,
    //         isInTorrentOrDdl: false,
    //         movieTitle: null
    //     };
    // }

    /**
     * Clears all the torrents / ddl results
     */
    const clearTorrentsOrDdl = () => {
        // this.setState({
        //     torrentsList: null,
        //     providersmovies: null
        // })

        setTorrentsList(null);
        setProvidersMovies(null);
    };

    // Start the download of a torrent file (in realdebrid)
    const downloadTorrentFile = async (torrent) => {
        // const movieTitle = this.state.movieInfo.title;
        // console.log(this.state.movieInfo);

        // this.setState({movieInfoLoading: true, movieInfo: null, torrentsList: null});
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

            // this.setState({movieInfoLoading: false});
            setMovieInfoLoading(false);

            setTimeout(() => {
                props.closeDialog();
            }, 2000);

        } catch(error) {
            props.displaySnackMessage('Error while downloading torrent file');
            // this.setState({movieInfoLoading: false});
            setMovieInfoLoading(false);
            props.closeDialog();
        }
    };

    // Find available qualities for a particular ddl provider
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

    // Start in full screen the movie trailer
    const startTrailer = () => {
        screenfull.request(findDOMNode(this.player));
        // this.setState({trailerPlaying: true});
        setTrailerPlaying(true);
    };

    // Get a list of all torrents available
    const getTorrentsList = async movie => {
        // this.setState({movieInfoLoading: true, movieInfo: null, isInTorrentOrDdl: true});
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

            // console.log('foo')
            // this.setState({movieInfoLoading: false, torrentsListFull: torrentsTagguedToReturn, torrentsList: torrentsTagguedToReturn});
            setMovieInfoLoading(false);
            setTorrentsListFull(torrentsTagguedToReturn);
            setTorrentsList(torrentsTagguedToReturn)
        } catch(error) {
            props.displaySnackMessage('Error while getting qualities');
            // this.setState({loading: false})
            setMovieInfoLoading(false);
        }
    };

    // Search movies in ddl providers
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

    // Get movie info at rendering
    // componentDidMount() {
    //     this.setState({showInfoDialog: this.props.showInfoDialog});
    //     this.getMovieInfo(this.props.selectedMovie);
    // };

    // Same effect as componentDidMount
    useEffect(() => {
        showInfoDialog ? null : getMovieInfo(props.selectedMovie);
        setShowInfoDialog(props.showInfoDialog);
    });

    // Getting movie info
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
                setMovieInfoLoading(false);
                setMovieTitle(movieInfo.title);
            } else {
                props.displaySnackMessage('Error getting infos');
                // this.setState({movieInfo: null, movieInfoLoading: false});
                setMovieInfo(null);
                setMovieInfoLoading(false);
            }

        } catch(error) {
            props.displaySnackMessage('Error getting infos');
        }
    };

    // Starts the download of a particular quality, for a particular movie, using a particular provider
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

    // Close the dialog and clears data
    const closeDialog = () => {
        // this.setState({torrentsList: null, isInTorrentOrDdl: false});
        setTorrentsList(null);
        setIsInTorrentOrDdl(false);
        props.closeDialog();
    };

    // TODO : remove all state parts --> rewrite algo without state use (refacto WIP)
    const filterTorrents = filter => {

        // console.log(filter);
        // console.log(this.state[filter]);

        this.setState({
            [filter]: !this.state[filter]
        }, () => {
            const trueFilter = [];

            if (this.state.uhd) {
                trueFilter.push('uhd');
            }

            if (this.state.fullHd) {
                trueFilter.push('fullHd');
            }

            if (this.state.hd) {
                trueFilter.push('hd');
            }

            if (this.state.multi) {
                trueFilter.push('multi');
            }

            const torrentsFiltered = this.state.torrentsListFull[0].torrents.map(torrent => {

                let shouldBeDisplayed = false;

                if (trueFilter.length > 0) {
                    trueFilter.map(filter => {
                        if (Object.keys(torrent.tags).filter((key) => torrent.tags[key]).includes(filter)) {
                            shouldBeDisplayed = true;
                        }
                    });
                } else {
                    shouldBeDisplayed = true;
                }

                torrent.isDisplayed = shouldBeDisplayed;

                if (torrent.isDisplayed) {
                    return torrent;
                }

            });

            const torrentsTagguedToReturn = [];

            torrentsTagguedToReturn.push({
                torrents : torrentsFiltered.filter(torrent => torrent !== undefined),
                provider: 'ygg'
            });

            this.setState({torrentsList: torrentsTagguedToReturn});
        });

    };

    // TODO: finish ddl parts + extract some more components
    // const { showInfoDialog, selectedMovie } = this.props;

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
                        <div className="movieInfoDialog">

                            <h2>Torrents</h2>

                            <Chip label={'4K'} style={uhd ? styles.h264Full : styles.h264} clickable={true} onClick={() => filterTorrents('uhd')}/>
                            <Chip label={'1080p'} style={fullHd ? styles.h264Full : styles.h264} clickable={true} onClick={() => filterTorrents('fullHd')}/>
                            <Chip label={'720p'} style={hd ? styles.multiChipFull : styles.multiChip} clickable={true} onClick={() => filterTorrents('hd')}/>
                            <Chip label={'Multi'} style={multi ? styles.blurayFull : styles.bluray} clickable={true} onClick={() => filterTorrents('multi')}/>

                            <List component="nav" dense >

                                {
                                    torrentsList.map(provider => {
                                        return (
                                            <div>
                                                <h3>
                                                    {provider.provider}
                                                </h3>

                                                {
                                                    provider.torrents.length > 0 ?

                                                        provider.torrents.map(torrent => {
                                                            return (
                                                                <Paper elevation={1} style={
                                                                    torrent.isDisplayed ?
                                                                        {
                                                                            margin: '5px',
                                                                            backgroundColor: '#757575',
                                                                            visibility: 'visible'
                                                                        }
                                                                        :
                                                                        {
                                                                            margin: '5px',
                                                                            backgroundColor: '#757575',
                                                                            visibility: 'hidden'
                                                                        }
                                                                }>

                                                                    <ListItem button
                                                                              style={{overflow: 'hidden'}}>


                                                                        <ListItemText

                                                                            style={{padding: '0'}}

                                                                            primary= {
                                                                                <div style={{
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    whiteSpace: 'nowrap'
                                                                                }}>
                                                                                    {torrent.title}
                                                                                </div>
                                                                            }

                                                                            secondary={

                                                                                <div style={{
                                                                                    overflow: 'auto',
                                                                                    whiteSpace: 'nowrap'
                                                                                }}
                                                                                     className="torrentsChips">

                                                                                    {/* Video quality */}

                                                                                    {
                                                                                        torrent.tags.threeD ? <Chip label={'3D'} style={styles.multiChip} /> : null
                                                                                    }

                                                                                    {
                                                                                        torrent.tags.uhd ? <Chip label={'4k'} style={styles.h264} /> : null
                                                                                    }

                                                                                    {
                                                                                        torrent.tags.fullHd ? <Chip label={'1080p'} style={styles.h264} /> : null
                                                                                    }

                                                                                    {
                                                                                        torrent.tags.hd ? <Chip label={'720p'} style={styles.multiChip} /> : null
                                                                                    }

                                                                                    {
                                                                                        torrent.tags.hdlight ? <Chip label={'hdlight'} style={styles.multiChip} /> : null
                                                                                    }

                                                                                    {
                                                                                        torrent.tags.bdrip ? <Chip label={'bdrip'} style={styles.multiChip} /> : null
                                                                                    }

                                                                                    {
                                                                                        torrent.tags.h264 ? <Chip label={'h264'} style={styles.multiChip} /> : null
                                                                                    }

                                                                                    {
                                                                                        torrent.tags.h265 ? <Chip label={'h265'} style={styles.h264} /> : null
                                                                                    }


                                                                                    {/* Language */}

                                                                                    {
                                                                                        torrent.tags.multi ? <Chip label={'multi'} style={styles.bluray} /> : null
                                                                                    }

                                                                                    {
                                                                                        torrent.tags.vo ?  (torrent.tags.vostfr ? <Chip label={'vostfr'} style={styles.frenchChip} /> : <Chip label={'vo'} style={styles.frenchChip} />) : null
                                                                                    }

                                                                                    {
                                                                                        torrent.tags.vf ? (torrent.tags.vfq ? <Chip label={'vfq'} style={styles.frenchChip} /> : <Chip label={'vf'} style={styles.frenchChip} />) : null
                                                                                    }

                                                                                    {
                                                                                        torrent.tags.french ? <Chip label={'french'} style={styles.frenchChip} /> : null
                                                                                    }

                                                                                    {/* Audio quality */}

                                                                                    {
                                                                                        torrent.tags.aac ? <Chip label={'aac'} style={styles.hdChip} /> : null
                                                                                    }

                                                                                    {
                                                                                        torrent.tags.dts ? <Chip label={'dts'} style={styles.hdChip} /> : null
                                                                                    }

                                                                                </div>

                                                                            }

                                                                            onClick={() => downloadTorrentFile(torrent)}/>
                                                                    </ListItem>
                                                                </Paper>
                                                            )
                                                        })
                                                        :
                                                        <div style={{
                                                            fontSize: '0.9rem',
                                                            color: 'grey'
                                                        }}>no torrents found</div>
                                                }
                                            </div>
                                        )
                                    })}
                            </List>
                        </div>

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
