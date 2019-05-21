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
import Link from "react-router-dom/es/Link";
import Fab from '@material-ui/core/Fab';
import ListItemIcon from "@material-ui/core/ListItemIcon";


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

class MovieInfoDialog extends React.Component {

    constructor(props)
    {
        super(props);
        this.state = {
            uhd: false,
            fullHd: false,
            hd: false,
            movieInfoLoading: false,
            movieInfo: null,
            trailerPlaying: false,
            torrentsList: null,
            providersMovies: null,
            qualities: null,
            isInTorrentOrDdl: false,
            movieTitle: null
        };
    }

    /**
     * Clears all the torrents / ddl results
     */
    clearTorrentsOrDdl = () => {
        this.setState({
            torrentsList: null,
            providersmovies: null
        })
    };

    // Start the download of a torrent file (in realdebrid)
    downloadTorrentFile = async (torrent) => {
        // const movieTitle = this.state.movieInfo.title;
        // console.log(this.state.movieInfo);

        this.setState({movieInfoLoading: true, movieInfo: null, torrentsList: null});

        const { selectedMovie } = this.props;

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
                    title: this.state.movieTitle,
                    id: selectedMovie.id,
                })
            });

            response = await response.json();

            if (response.message !== 'ok') {
                this.props.displaySnackMessage('Error while downloading torrent file');
            } else {
                this.props.displaySnackMessage('Torrent added - check progress in downloads');
            }

            this.setState({movieInfoLoading: false});

            setTimeout(() => {
                this.props.closeDialog();
            }, 2000);

        } catch(error) {
            this.props.displaySnackMessage('Error while downloading torrent file');
            this.setState({movieInfoLoading: false});
            this.props.closeDialog();
        }
    };

    // Find available qualities for a particular ddl provider
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
            // let response = await fetch('/api/torrents?title=' + movie.title, {
            //     method: 'GET'
            // });
            //
            // const torrents = await response.json();

            const torrents = [{
                'provider': 'ygg',
                'torrents': [
                    {
                        completed: "64",
                        leech: "0",
                        provider: "ygg",
                        seed: "10",
                        size: "266.95Mo",
                        title: "Avengers Infinity War (2018) MULTi VFQ 1080p BluRay REMUX AVC DTS.GHT (Avengers : La guerre de l'infini) vf 4k ac3",
                        url: "https://www2.yggtorrent.ch/torrent/audio/musique/233399-alan+silvestri+avengers+infinity+war+original+motion+picture+soundtrack+2018web+mp3+320kbps"
                    }, {
                        completed: "35",
                        leech: "0",
                        provider: "ygg",
                        seed: "9",
                        size: "592.12Mo",
                        title: "Alan Silvestri – Avengers: Infinity War (Original Motion Picture Soundtrack) (2018)(web.flac.16bit) ",
                        url: "https://www2.yggtorrent.ch/torrent/audio/musique/233400-alan+silvestri+avengers+infinity+war+original+motion+picture+soundtrack+2018web+flac+16bit"
                    }, {
                        completed: "747",
                        leech: "1",
                        provider: "ygg",
                        seed: "134",
                        size: "1.73Go",
                        title: "Avengers Infinity War (2018) French AAC BluRay 720p x264.GHT (Avengers:  La guerre de l'infini) vfq ac3 aac vf 1080p 4k uhd ",
                        url: "https://www2.yggtorrent.ch/torrent/film-video/film/295275-avengers+infinity+war+2018+french+aac+bluray+720p+x264+ght+avengers+la+guerre+de+linfini"
                    }
                ]
            }];

            const torrentsTaggued = torrents[0].torrents.map(torrent => {

                torrent.multi = !!torrent.title.match(/multi/mi);
                torrent.french = !!torrent.title.match(/french/mi);
                torrent.vo = !!torrent.title.match(/vo/mi);
                torrent.aac = !!torrent.title.match(/aac|ac3/mi);
                torrent.dts = !!torrent.title.match(/dts/mi);
                torrent.fullHd= !!torrent.title.match(/1080p/mi);
                torrent.hd = !!torrent.title.match(/720p/mi);
                torrent.h264 = !!torrent.title.match(/x264|h264/mi);
                torrent.h265 = !!torrent.title.match(/x265|h265/mi);
                // torrent.bluray = !!torrent.title.match(/bluray/mi);
                torrent.vfq = !!torrent.title.match(/vfq/mi);
                torrent.hdlight = !!torrent.title.match(/hdlight/mi);
                // torrent.ac3 = !!torrent.title.match(/ac3/mi);
                torrent.vostfr = !!torrent.title.match(/stfr/mi);
                torrent.bdrip = !!torrent.title.match(/bdrip/mi);
                torrent.uhd = !!torrent.title.match(/2160p|4k|uhd/mi);
                torrent.threeD = !!torrent.title.match(/3d/mi);
                torrent.vf = !!torrent.title.match(/vf/mi);

                torrent.isDisplayed = true;

                return torrent;
            });

            const torrentsTagguedToReturn = [];

            torrentsTagguedToReturn.push({
                torrents : torrentsTaggued,
                provider: 'ygg'
            });

            // console.log('foo')
            this.setState({movieInfoLoading: false, torrentsList: torrentsTagguedToReturn});
        } catch(error) {
            this.props.displaySnackMessage('Error while getting qualities');
            this.setState({loading: false})
        }
    };

    // Search movies in ddl providers
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
        // const test = qs.parse(this.props.location);
        // console.log(test);
        // console.log(this.props);
        this.setState({showInfoDialog: this.props.showInfoDialog});
        this.getMovieInfo(this.props.selectedMovie);
    };

    // componentDidUpdate(prevProps, prevState, snapshot) {
    //
    //     if (this.state.torrentsList) {
    //         this.state.torrentsList[0].torrents.map(torrent => {
    //
    //             console.log(this.state.fullHd);
    //
    //             torrent.isDisplayed = this.state.fullHd;
    //
    //             // if (!this.state.fullHd && torrent.fullHd) {
    //             //     torrent.isDisplayed = true;
    //             // } else if (!this.state.fullHd && !torrent.fullHd) {
    //             //     torrent.isDisplayed = false;
    //             // } else {
    //             //     torrent.isDisplayed = true;
    //             // }
    //
    //         })
    //     }
    //
    // }

    // componentWillMount() {
    //     console.log(this.props);
    // }

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
        this.setState({movieInfoLoading: true, torrentsList: null, providersMovies: null, isInTorrentOrDdl: false, qualities: null});
        try {
            let movieInfo = await fetch('/api/movie_info?id=' + movie.id);
            movieInfo =  await movieInfo.json();

            if (!movieInfo.error) {
                this.setState({movieInfo: movieInfo, movieInfoLoading: false, movieTitle: movieInfo.title});
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

    filterTorrents = filter => {

        console.log(filter);
        console.log(this.state[filter]);

        this.setState({
            [filter]: !this.state[filter]
        }, () => {
            console.log(this.state[filter]);

            this.state.torrentsList[0].torrents.map(torrent => {


                if (this.state[filter]) {
                    if (torrent[filter]) {
                        torrent.isDisplayed = true;
                    } else {
                        torrent.isDisplayed = false;
                    }
                } else {
                    if (torrent[filter]) {
                        torrent.isDisplayed = true;
                    } else {
                        torrent.isDisplayed = true;
                    }
                }


                // if (!this.state[filter] && torrent[filter] ) {
                //     torrent.isDisplayed = true;
                // } else if (!this.state[filter] && !torrent[filter] ) {
                //     torrent.isDisplayed = false;
                // } else {
                //     torrent.isDisplayed = true;
                // }

            })
        });

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

                        {/*<Button*/}
                            {/*onClick={() => closeDialog()}*/}
                            {/*variant="fab"*/}
                            {/*mini*/}
                            {/*style={{margin: '5px', position: 'fixed', zIndex: '2', backgroundColor: '#757575', color: "white", right: '0'}}>*/}
                            {/*<Close />*/}
                        {/*</Button>*/}

                        {/*<Link to={{pathname: '/movies', search: `?genre=${this.props.genreSelected.id}`}} style={{ textDecoration: 'none', color: 'white' }}>*/}
                            {/*<Button*/}
                                {/*onClick={() => closeDialog()}*/}
                                {/*variant="fab"*/}
                                {/*mini*/}
                                {/*style={{margin: '5px', position: 'fixed', zIndex: '2', backgroundColor: '#757575', color: "white", right: '0'}}>*/}
                                {/*<Close />*/}
                            {/*</Button>*/}
                        {/*</Link>*/}

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
                            to={{pathname: '/movies', search: `?genre=${this.props.genreSelected.id}`}}>
                            <Close/>
                        </Fab>


                        <Button
                            onClick={() => this.getMovieInfo(this.props.selectedMovie)}
                            variant="fab"
                            mini
                            style={this.state.isInTorrentOrDdl ? {margin: '5px', position: 'fixed', zIndex: '2', backgroundColor: '#757575', color: "white", left: '0'} : {display: 'none'}}>
                            <ArrowBack />
                        </Button>

                        <div style={{textAlign: 'center'}}>

                            <div style={this.state.movieInfoLoading ? {position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'} : {display: 'none'}}>
                                <CircularProgress/>
                            </div>

                            {/*Torrents list*/}
                            {this.state.torrentsList !== null ?
                                <div className="movieInfoDialog">

                                    <h2>Torrents</h2>

                                    <Chip label={'4K'} style={this.state.uhd ? styles.h264Full : styles.h264} clickable={true} onClick={() => this.filterTorrents('uhd')}/>
                                    <Chip label={'1080p'} style={this.state.fullHd ? styles.h264Full : styles.h264} clickable={true} onClick={() => this.filterTorrents('fullHd')}/>
                                    <Chip label={'720p'} style={this.state.hd ? styles.multiChipFull : styles.multiChip} clickable={true} onClick={() => this.filterTorrents('hd')}/>

                                    <List component="nav" dense >

                                        {
                                            this.state.torrentsList.map(provider => {
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
                                                                                                torrent.threeD ? <Chip label={'3D'} style={styles.multiChip} /> : null
                                                                                            }

                                                                                            {
                                                                                                torrent.uhd ? <Chip label={'4k'} style={styles.h264} /> : null
                                                                                            }

                                                                                            {
                                                                                                torrent.fullHd ? <Chip label={'1080p'} style={styles.h264} /> : null
                                                                                            }

                                                                                            {
                                                                                                torrent.hd ? <Chip label={'720p'} style={styles.multiChip} /> : null
                                                                                            }

                                                                                            {
                                                                                                torrent.hdlight ? <Chip label={'hdlight'} style={styles.multiChip} /> : null
                                                                                            }

                                                                                            {
                                                                                                torrent.bdrip ? <Chip label={'bdrip'} style={styles.multiChip} /> : null
                                                                                            }

                                                                                            {
                                                                                                torrent.h264 ? <Chip label={'h264'} style={styles.multiChip} /> : null
                                                                                            }

                                                                                            {
                                                                                                torrent.h265 ? <Chip label={'h265'} style={styles.h264} /> : null
                                                                                            }


                                                                                            {/* Language */}

                                                                                            {
                                                                                                torrent.multi ? <Chip label={'multi'} style={styles.bluray} /> : null
                                                                                            }

                                                                                            {
                                                                                                torrent.vo ?  (torrent.vostfr ? <Chip label={'vostfr'} style={styles.frenchChip} /> : <Chip label={'vo'} style={styles.frenchChip} />) : null
                                                                                            }

                                                                                            {
                                                                                                torrent.vf ? (torrent.vfq ? <Chip label={'vfq'} style={styles.frenchChip} /> : <Chip label={'vf'} style={styles.frenchChip} />) : null
                                                                                            }

                                                                                            {
                                                                                                torrent.french ? <Chip label={'french'} style={styles.frenchChip} /> : null
                                                                                            }

                                                                                            {/* Audio quality */}

                                                                                            {
                                                                                                torrent.aac ? <Chip label={'aac'} style={styles.hdChip} /> : null
                                                                                            }

                                                                                            {
                                                                                                torrent.dts ? <Chip label={'dts'} style={styles.hdChip} /> : null
                                                                                            }

                                                                                        </div>

                                                                                    }

                                                                                    onClick={() => this.downloadTorrentFile(torrent)}/>
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
                            {this.state.providersMovies !== undefined ?
                                this.state.providersMovies !== null  ?
                                    this.state.providersMovies[0].results.length > 0 ?
                                        <div>
                                            {this.state.providersMovies.map(provider => {
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