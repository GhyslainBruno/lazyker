import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Search from '@material-ui/icons/SearchOutlined';
import AddCircle from '@material-ui/icons/AddCircleOutlined';
import Remove from '@material-ui/icons/RemoveOutlined';
import Close from '@material-ui/icons/CloseOutlined';
import Delete from '@material-ui/icons/DeleteOutlined';
import Sync from '@material-ui/icons/SyncOutlined';
import SyncDisabled from '@material-ui/icons/SyncDisabledOutlined';
import ArrowBack from '@material-ui/icons/ArrowBackOutlined';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Language from '@material-ui/icons/LanguageOutlined';
import Brightness1 from '@material-ui/icons/Brightness1';
import Modal from '@material-ui/core/Modal';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Input from '@material-ui/core/Input';
import Snackbar from '@material-ui/core/Snackbar';
import Avatar from '@material-ui/core/Avatar';
import green from '@material-ui/core/colors/green';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import Badge from '@material-ui/core/Badge';
import Slide from '@material-ui/core/Slide';
import '../App.scss';
import * as auth from "../firebase/auth";
import Paper from "@material-ui/core/Paper";
import OutlinedInput from "@material-ui/core/OutlinedInput/OutlinedInput";
import Chip from "@material-ui/core/Chip";

function Transition(props) {
    return <Slide direction="up" {...props} />;
}


const styles = {
    outlinedChip : {
        border: 'thin solid grey',
        backgroundColor: 'transparent',
        margin: '5px'
    },
    // Video quality
    multiChipFull: {
        border: 'thin solid #ffe317',
        backgroundColor: '#ffe317',
        opacity: '0.7',
        margin: '2px',
        // color: '#ffe317'
    },
    h264Full: {
        border: 'thin solid #ffa489',
        backgroundColor: '#ffa489',
        opacity: '0.7',
        margin: '2px'
    },
    blurayFull: {
        border: 'thin solid #b4ff56',
        backgroundColor: '#b4ff56',
        opacity: '0.7',
        margin: '2px'
    },
    multiChip: {
        border: 'thin solid #ffe317',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#ffe317'
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

class Shows extends Component {

  constructor(props)
  {
      super(props);
      this.state = {
          shows: null,
          showTitleToSearch: null,
          navigation: null,
          isInSearchView: null,
          dialogTitle: null,
          dialogMessage: null,
          showDialog: false,
          showInfoDialog: false,
          addOrRemoveString: null,
          showToAdd: null,
          showToRemove: null,
          snack: false,
          snackBarMessage: null,
          loading: false,
          infoShow: null,
          // showLang: null,
          showToDisplayInfo: null,
          openShowDownloadDialog: false,
          showToDownload: null,
          episodeTorrentsLoading: false,
          episodeTorrentsFull: null,
          episodeTorrents: null,
          seasonNumber: null,
          episodeNumber: null,
          qualityEpisode: null,
          showInfoLoading: false

      };

      props.changeNavigation('shows');

  }

  // componentDidUpdate() {
  //   console.log('state is', this.state);
  // }


    // Searching for a new tv show
    searchShow = async () => {

      this.setState({isInSearchView: true, loading: true, shows: []});

      const showTitle = document.getElementById('show_title_to_search').value;

      fetch('/api/search_shows?title=' + showTitle, {
          method: 'GET',
          headers: {
              'token': await auth.getIdToken()
          }
      })
          .then(response => {
              return response.json()
          })
          .then(data => {
              this.setState({shows: data, loading: false});
          })
          .catch(error => {
              this.setState({snack: true, snackBarMessage: 'Error searching shows', loading: false, isInSearchView: false})
          })

  };

    // Loading shows from database
    loadShowsInDb = async () => {
        this.setState({loading: true, shows: [], showTitleToSearch: ''});

        try {

            let response = await fetch('/api/shows', {
                method: 'GET',
                headers: {
                    'token': await auth.getIdToken()
                }
            }
        );
            response = await response.json();
            this.setState({ shows: response , loading: false, isInSearchView: false});

        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error getting shows', loading: false, isInSearchView: false})
        }

    };

    async componentWillMount() {
        await this.loadShowsInDb();
        await this.clearNewEpisodesTags();
    }

    clearNewEpisodesTags = async () => {
        fetch('/api/clear_new_episodes',{
            headers: {
                'token': await auth.getIdToken()
            }
        })
            .then(response => {
                return response.json()
            })
            .then(data => {
                return null
            })
            .catch(error => {
                this.setState({snack: true, snackBarMessage: 'Error clearing new episodes tags', loading: false, isInSearchView: false})
            })
    };

    updateShowTitleToSearch = (evt) => {
        this.setState({
            showTitleToSearch: evt.target.value
        });
    };

    closeDialog = () => {
        this.setState({showDialog: false})
    };

    closeInfoDialog = () => {
        this.setState({showInfoDialog: false})
    };

    showAddShowDialog = (e, show) => {

        this.setState({
            showDialog: true,
            dialogTitle: 'Add show',
            dialogMessage: 'Do you want to add ' + show.title + ' to your list of shows ?',
            addOrRemoveString: 'Add',
            showToAdd: show
        });

    };

    showRemoveShowDialog = (e, show) => {

        this.setState({
            showDialog: true,
            dialogTitle: 'Remove show',
            dialogMessage: 'Do you want to remove ' + show.title + ' of your list of shows ?',
            addOrRemoveString: 'Remove',
            showToRemove: show
        });

    };

    // Adding a new tv show to database
    addShow = async () => {

        try {

            this.closeDialog();
            this.setState({loading: true, shows: []});
            const show = this.state.showToAdd;

            await fetch('/api/show', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    show: show
                })
            });

            this.setState({loading: false});

            this.loadShowsInDb();

        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error adding show', loading: false, isInSearchView: false})
        }

    };

    onEnterKeyPressed = (event) => {
        if (event.keyCode || event.which === 13) {

            this.searchShow();

        }
    };

    // onEnterKeyPressedInShowDownload = (event) => {
    //     if (event.keyCode || event.which === 13) {
    //
    //         this.searchShowEpisodeTorrents();
    //
    //     }
    // };

    // Removing a tv show from database
    removeShow = async () => {

        this.closeDialog();

        const show = this.state.showToRemove;

        await fetch('/api/show', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'token': await auth.getIdToken()
            },
            body: JSON.stringify({
                show: show
            })
        });

        this.loadShowsInDb();

    };

    // Changing the "autoUpdate" state of the tv show | TODO add a try/catch block here
    updateShow = async (show) => {

        show.autoUpdate = !show.autoUpdate;

        let response = await fetch('/api/show', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'token': await auth.getIdToken()
            },
            body: JSON.stringify({
                show: show
            })
        });

        response = await response.json();

        this.setState({snack: true, snackBarMessage: show.title + ' updated'})
    };

    /**
     * Opens the dialog with downloads parts - and fetch episodes numbers
     */
    openShowDownloadDialog = async show => {

        try {

            this.setState({openShowDownloadDialog: true, showToDownload: show, showInfoLoading: true});

            const response = await fetch('/api/show/' + show.id, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                }
            });

            const showInfo = await response.json();

            this.setState({
                seasonsEpisodesNumbers: showInfo.show.seasonsEpisodesNumbers,
                showInfoLoading: false
            });


        } catch (error) {
            this.setState({
                showInfoLoading: false
            });
        }

    };

    /**
     * Closes the dialog with downloads parts
     * */
    closeShowDownloadDialog = () => {
        this.setState({
            openShowDownloadDialog: false,
            episodeTorrents: null,
            showToDownload: null,
            episodeNumber: null,
            seasonNumber: null,
            episodeTorrentsLoading: false,
            qualityEpisode: null});
    };

    clearTitle = () => {
        this.setState({showTitleToSearch: ''})
    };

    showTvShowInfoDialog = (show) => {

        if (!this.state.isInSearchView) {
            this.setState({
                showToDisplayInfo: show,
                showInfoDialog: true,
                showLang: show.lang
            });
        }

    };

    // Changing the lang of the tv show (vostfr, french, multi)
    changeShowLang = async event => {

        const show = this.state.showToDisplayInfo;
        show.lang = event.target.value;

        try {
            await fetch('/api/show', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    show: show
                })
            });

            this.setState({snack: true, snackBarMessage: show.title + ' lang updated', showLang: show.lang})

        } catch (error) {
            this.setState({snack: true, snackBarMessage: 'Error changing lang', loading: false, isInSearchView: false})
        }
    };

    // Util function for download show dialog textField - deprecated since not using any textField for that right now
    handleChange = search => event => {
        this.setState({
            [search]: event.target.value,
        });
    };

    // Function triggered to fetch tv show episode available torrents
    searchShowEpisodeTorrents = async () => {

        this.setState({episodeTorrentsLoading: true, episodeTorrents: null});

        try {
            // add  ${this.state.qualityEpisode} to use quality
            let searchString = '';

            if (this.state.seasonNumber) {
                searchString = `${this.state.showToDownload.title} S${this.state.seasonNumber}`;
            } else {
                searchString = `${this.state.showToDownload.title}`;
            }

            if (this.state.seasonNumber && this.state.episodeNumber) {
                searchString = `${this.state.showToDownload.title} S${this.state.seasonNumber}E${this.state.episodeNumber}`;
            }

            let response = await fetch(`/api/torrents?title=${searchString}`, {
                method: 'GET'
            });

            const torrents = await response.json();


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

                return torrent;
            });

            const torrentsTagguedToReturn = [];

            torrentsTagguedToReturn.push({
                torrents : torrentsTaggued,
                provider: 'ygg'
            });


            this.setState({episodeTorrentsLoading: false, episodeTorrents: torrentsTagguedToReturn, episodeTorrentsFull: torrentsTagguedToReturn});
        } catch(error) {
            this.props.displaySnackMessage('Error while getting episode torrents');
            this.setState({episodeTorrentsLoading: false})
        }

    };

    // Starts the download of the torrent for this episode of this tv show wanted
    downloadEpisodeTorrent = async torrent => {

        this.setState({episodeTorrentsLoading: true, episodeTorrents: null});

        try {
            let response = await fetch('/api/episode_torrents', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    url: torrent.url,
                    provider: torrent.provider,
                    title: torrent.title,
                    mediaInfos: {
                        lastSeason: this.state.seasonNumber,
                        lastEpisode: this.state.episodeNumber,
                        name: this.state.showToDownload.title,
                        isShow: true
                    },
                    id: torrent.title,
                })
            });

            response = await response.json();

            if (response.message !== 'ok') {
                this.setState({snackBarMessage: 'Error while downloading torrent file', snack: true});
            } else {
                this.setState({snackBarMessage: 'Torrent added - check progress in downloads', snack: true});
            }

            this.setState({episodeTorrentsLoading: false});

            setTimeout(() => {
                this.closeShowDownloadDialog();
            }, 2000);

        } catch(error) {
            this.setState({snackBarMessage: 'Error while downloading torrent file', snack: true, episodeTorrentsLoading: false});
            this.closeShowDownloadDialog();
        }

    };

    handlerSeasonNumberChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handlerEpisodeNumberChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handlerQualityEpisodeChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    createSeasonsNumbersTable = () => {
        let table = [];
        table.push(<MenuItem value={null}>{""}</MenuItem>);

        if (this.state.seasonsEpisodesNumbers) {
            const seasonsNumber = this.state.seasonsEpisodesNumbers.filter(season => season.season_number === Math.max.apply(Math, this.state.seasonsEpisodesNumbers.map(function(o) { return o.season_number; })))[0].season_number;

            for (let i = 0; i < seasonsNumber; i++) {

                const number = parseInt(i + 1).toString().padStart(2, '0');

                table.push(<MenuItem value={number}>{number}</MenuItem>);
            }

            return table
        }

    };

    createEpisodesNumbersTable = () => {
        let table = [];
        table.push(<MenuItem value={null}>{""}</MenuItem>);

        if (this.state.seasonsEpisodesNumbers && this.state.seasonNumber) {

            const episodesNumber = this.state.seasonsEpisodesNumbers.filter(season => season.season_number === parseInt(this.state.seasonNumber))[0].episode_count;

            for (let i = 0; i < episodesNumber; i++) {

                const number = parseInt(i + 1).toString().padStart(2, '0');


                table.push(<MenuItem value={number}>{number}</MenuItem>);
            }

            return table
        }

    };

    filterTorrents = filter => {

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

            const torrentsFiltered = this.state.episodeTorrentsFull[0].torrents.map(torrent => {

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

            this.setState({episodeTorrents: torrentsTagguedToReturn});
        });

    };

    render() {

        if (this.state.shows != null) {
          return (

          <div className="Foo" style={{textAlign: "center", paddingBottom: '10%'}}>

              <Snackbar
                  open={this.state.snack}
                  onClose={() => this.setState({snack: false})}
                  autoHideDuration={2000}
                  message={this.state.snackBarMessage}
              />

              <Dialog
                  fullScreen
                  open={this.state.openShowDownloadDialog}
                  onClose={this.handleClose}
                  TransitionComponent={Transition}
              >

                  <Button
                      onClick={() => this.closeShowDownloadDialog()}
                      variant="fab"
                      mini
                      style={{margin: '5px', position: 'fixed', zIndex: '2', backgroundColor: '#757575', color: "white", right: '0'}}>
                      <Close />
                  </Button>

                  <div className="movieInfoDialog">

                      <h1 style={{textAlign: 'center'}}>{this.state.showToDownload ? this.state.showToDownload.title : null}</h1>

                      {
                          this.state.showInfoLoading ?

                              <div style={{textAlign: 'center'}}>
                                  <CircularProgress style={this.state.showInfoLoading ? {display: 'inline-block', marginTop: '40px'} : {display: 'none'}}/>
                              </div>

                              :

                              <div>
                                  <Grid container spacing={0}>

                                      <Grid item xs={12} style={{padding: '6px', color: 'white', textAlign: 'center'}}>
                                          Select the episode wanted
                                      </Grid>

                                      <Grid item xs={6} style={{padding: '6px', textAlign: 'center'}}>
                                          <FormControl style={{minWidth: '80px'}} variant="outlined">
                                              <Select
                                                  value={this.state.seasonNumber}
                                                  onChange={this.handlerSeasonNumberChange}
                                                  input={
                                                      <OutlinedInput
                                                          labelWidth={this.state.labelWidth}
                                                          name="seasonNumber"
                                                          id="season-number"
                                                      />
                                                  }>

                                                  {
                                                      this.createSeasonsNumbersTable()
                                                  }

                                              </Select>
                                              <FormHelperText>Season number</FormHelperText>
                                          </FormControl>
                                      </Grid>

                                      <Grid item xs={6} style={{padding: '6px', textAlign: 'center'}}>
                                          <FormControl style={{minWidth: '80px'}} variant="outlined">
                                              <Select
                                                  value={this.state.episodeNumber}
                                                  onChange={this.handlerEpisodeNumberChange}
                                                  input={
                                                      <OutlinedInput
                                                          labelWidth={this.state.labelWidth}
                                                          name="episodeNumber"
                                                          id="episode-number"
                                                      />
                                                  }>

                                                  {
                                                      this.createEpisodesNumbersTable()
                                                  }

                                              </Select>
                                              <FormHelperText>Episode number</FormHelperText>
                                          </FormControl>
                                      </Grid>

                                      {/*// Quality selector - not used for now*/}
                                      {/*<Grid item xs={4} style={{padding: '6px'}}>*/}
                                      {/*<FormControl style={{minWidth: '80px'}} variant="outlined">*/}
                                      {/*<Select*/}
                                      {/*disabled*/}
                                      {/*value={this.state.qualityEpisode}*/}
                                      {/*onChange={this.handlerQualityEpisodeChange}*/}
                                      {/*input={*/}
                                      {/*<OutlinedInput*/}
                                      {/*labelWidth={this.state.labelWidth}*/}
                                      {/*name="qualityEpisode"*/}
                                      {/*id="quality-episode"*/}
                                      {/*/>*/}
                                      {/*}>*/}

                                      {/*<MenuItem value="">*/}
                                      {/*<em>None</em>*/}
                                      {/*</MenuItem>*/}
                                      {/*<MenuItem value={'hdtv'}>HDTV</MenuItem>*/}
                                      {/*<MenuItem value={'720'}>720p</MenuItem>*/}
                                      {/*<MenuItem value={'1080'}>1080p</MenuItem>*/}
                                      {/*<MenuItem value={'multi'}>Multi</MenuItem>*/}
                                      {/*<MenuItem value={'vf'}>VF</MenuItem>*/}
                                      {/*<MenuItem value={'vostfr'}>VOSTFR</MenuItem>*/}

                                      {/*</Select>*/}
                                      {/*<FormHelperText>Quality</FormHelperText>*/}
                                      {/*</FormControl>*/}
                                      {/*</Grid>*/}

                                      {/*<Grid item xs={1}>*/}
                                          {/*<IconButton>*/}
                                              {/*<Search onClick={() => this.searchShowEpisodeTorrents()}/>*/}
                                          {/*</IconButton>*/}
                                      {/*</Grid>*/}

                                  </Grid>

                                  <div style={{width: '100%', textAlign: 'center'}}>
                                      <IconButton>
                                          <Search onClick={() => this.searchShowEpisodeTorrents()}/>
                                      </IconButton>
                                  </div>

                                  <div style={{textAlign: 'center'}}>
                                      <CircularProgress style={this.state.episodeTorrentsLoading ? {display: 'inline-block', marginTop: '40px'} : {display: 'none'}}/>
                                  </div>


                                  {
                                      this.state.episodeTorrents !== null ?

                                          <div>
                                              <div style={{textAlign: 'center'}}>
                                                  <Chip label={'4K'} style={this.state.uhd ? styles.h264Full : styles.h264} clickable={true} onClick={() => this.filterTorrents('uhd')}/>
                                                  <Chip label={'1080p'} style={this.state.fullHd ? styles.h264Full : styles.h264} clickable={true} onClick={() => this.filterTorrents('fullHd')}/>
                                                  <Chip label={'720p'} style={this.state.hd ? styles.multiChipFull : styles.multiChip} clickable={true} onClick={() => this.filterTorrents('hd')}/>
                                                  <Chip label={'Multi'} style={this.state.multi ? styles.blurayFull : styles.bluray} clickable={true} onClick={() => this.filterTorrents('multi')}/>
                                              </div>

                                              <List component="nav" dense>
                                                  {this.state.episodeTorrents.map(provider => {
                                                      return (
                                                          <div>
                                                              <h3 style={{textAlign: 'center'}}>
                                                                  {provider.provider}
                                                              </h3>

                                                              {
                                                                  provider.torrents.length !== 0 ?
                                                                      provider.torrents.map(torrent => {
                                                                          return (
                                                                              <Paper elevation={1} style={{margin: '5px', backgroundColor: '#757575'}}>

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

                                                                                          onClick={() => this.downloadEpisodeTorrent(torrent)}/>
                                                                                  </ListItem>

                                                                                  {/*<ListItem button style={{overflow: 'hidden'}}>*/}
                                                                                  {/*    <ListItemText primary={torrent.title} onClick={() => this.downloadEpisodeTorrent(torrent)}/>*/}
                                                                                  {/*</ListItem>*/}
                                                                              </Paper>
                                                                          )})
                                                                      :
                                                                      <div style={{
                                                                          fontSize: '0.9rem',
                                                                          color: 'grey',
                                                                          textAlign: 'center'
                                                                      }}>No torrent found</div>

                                                              }
                                                          </div>
                                                      )
                                                  })}
                                              </List>

                                          </div>

                                          :
                                          null
                                  }
                              </div>

                      }


                  </div>

              </Dialog>

              <Dialog
                  open={this.state.showDialog}
                  onClose={this.closeDialog}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description">

                  <DialogTitle id="alert-dialog-title">{this.state.dialogTitle}</DialogTitle>

                  <DialogContent>
                      <DialogContentText id="alert-dialog-description">{this.state.dialogMessage}</DialogContentText>
                  </DialogContent>

                  <DialogActions>
                      <Button onClick={this.closeDialog} color="primary">
                          Cancel
                      </Button>
                      <Button onClick={this.state.isInSearchView ? this.addShow : this.removeShow} color="primary" autoFocus>
                          {this.state.addOrRemoveString}
                      </Button>
                  </DialogActions>
              </Dialog>

              <Dialog
                  open={this.state.showInfoDialog}
                  onClose={this.closeInfoDialog}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description">

                  <DialogTitle id="alert-dialog-title">Info</DialogTitle>

                  <DialogContent>

                      <DialogContentText id="alert-dialog-description">Select the language you want for this Tv Show</DialogContentText>

                      <div style={{marginTop: '1em', textAlign: 'center'}}>
                          <FormControl>
                              <InputLabel htmlFor="age-simple">Language</InputLabel>
                              <Select
                                  value={this.state.showLang}
                                  onChange={this.changeShowLang}
                                  inputProps={{
                                      name: 'showLang',
                                      id: 'show-lang',
                                  }}
                              >
                                  <MenuItem value={'vostfr'}>vostfr</MenuItem>
                                  <MenuItem value={'french'}>french</MenuItem>
                                  <MenuItem value={'multi'}>multi</MenuItem>
                              </Select>
                          </FormControl>
                      </div>


                  </DialogContent>

                  <DialogActions>
                      <Button onClick={this.closeInfoDialog} color="primary" autoFocus>
                          ok
                      </Button>
                  </DialogActions>
              </Dialog>


              <div style={{flexGrow: '1'}}>
                  <AppBar
                      position="static"
                      color="default">
                      <Toolbar>
                          <IconButton style={this.state.isInSearchView ? {visibility: 'visible', marginRight: '16px'} : {visibility: 'hidden', marginRight: '16px'}}>
                              <ArrowBack onClick={this.loadShowsInDb}/>
                          </IconButton>

                          <Input
                              id="show_title_to_search"
                              value={this.state.showTitleToSearch}
                              placeholder="TV Show title"
                              type="search"
                              onChange={evt => this.updateShowTitleToSearch(evt)}
                              disableUnderline={true}
                              style={{width: '80%'}}
                              onKeyPress={(event) => {this.onEnterKeyPressed(event)}}
                          />

                          <IconButton>
                              {this.state.showTitleToSearch !== null && this.state.showTitleToSearch !== '' ?
                                  <Close onClick={this.clearTitle}/>
                                  :
                                  <Search onClick={this.state.showTitleToSearch !== null && this.state.showTitleToSearch !== '' ? this.searchShow : null}/>
                              }

                          </IconButton>

                      </Toolbar>
                  </AppBar>
              </div>

              <CircularProgress style={this.state.loading ? {display: 'inline-block', marginTop: '40px'} : {display: 'none'}}/>

              <Grid container spacing={0} style={{marginTop: '10px'}}>

                  { this.state.shows.total > 0 ?

                      Object.keys(this.state.shows.shows).map(showFirebase => {

                          const show = this.state.shows.shows[showFirebase];

                      return (

                      <Grid item xs={4} style={{padding: '6px'}}>

                          <Card>

                              {/*<Badge badgeContent={<CheckCircle style={{fontSize: '20'}}/>}/>*/}

                              <CardMedia
                                  style={{paddingTop: '150%', position: 'relative'}}
                                  image={"https://image.tmdb.org/t/p/w500" + show.posterPath}
                                  title={show.title}
                                  onClick={() => this.openShowDownloadDialog(show)}
                                  clickable="true"
                              >
                                  <Badge
                                      style={show.episode ? {position: 'absolute', top: '0', right: '0', marginRight: '10%', marginTop: '10%'} : {display: 'none'}}
                                      badgeContent={<CheckCircle style={{fontSize: '20', color: '#f44336'}}/>}
                                  />
                              </CardMedia>

                              {this.state.isInSearchView ?

                                  <CardActions style={{display: 'flex'}} disableActionSpacing>
                                      <Button aria-label="add" style={{width: '100%'}} onClick={(e) => this.showAddShowDialog(e, show)}>
                                          <AddCircle />
                                      </Button>
                                  </CardActions>

                                  :

                                  <CardActions style={{display: 'flex'}} disableActionSpacing>

                                      <Button onClick={(e) => this.updateShow(show)} style={{minWidth: '0', flex: '1'}}>

                                          {show.autoUpdate ?
                                              <Sync style={{fontSize: '20'}}/>
                                              :
                                              <SyncDisabled style={{fontSize: '20'}}/>
                                          }
                                      </Button>

                                      <Button onClick={(e) => this.showRemoveShowDialog(e, show)} style={{minWidth: '0', flex: '1'}}>
                                          <Delete style={{fontSize: '20'}}/>
                                      </Button>

                                      <Button onClick={() => this.showTvShowInfoDialog(show)} style={{minWidth: '0', flex: '1'}}>

                                          <Language />

                                      </Button>

                                  </CardActions>
                              }

                          </Card>
                      </Grid>

                      )

                  })

                  :

                      <div style={this.state.loading ? {display: 'none'} : {display: 'inline-block', padding: '30px', color: 'grey', marginRight: 'auto', marginLeft: 'auto'}}>no results found</div>

                  }

              </Grid>

          </div>
        );
        } else {
          return null
        }

      }
}


export default Shows
