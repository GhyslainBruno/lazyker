import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Snackbar from '@material-ui/core/Snackbar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Delete';
import Error from '@material-ui/icons/Error';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CircularProgress from '@material-ui/core/CircularProgress';
import Download from '@material-ui/icons/GetApp';
import Delayed from '@material-ui/icons/WatchLater';
import Done from '@material-ui/icons/CheckCircle';
import PauseFilled from '@material-ui/icons/PauseCircleFilled';
import PauseCircle from '@material-ui/icons/PauseCircleOutline';
import PlayCircle from '@material-ui/icons/PlayCircleOutline';
import RemoveCircle from '@material-ui/icons/RemoveCircleOutline';
import LinearProgress from '@material-ui/core/LinearProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Clear from '@material-ui/icons/ClearAll';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Torrents from './downloads/Torrents';
import * as auth from "../firebase/auth";
import firebase from 'firebase';
const usersRef = firebase.database().ref('/users');



class Downloads extends Component {

    constructor(props)
    {
        super(props);
        this.state = {
            currentDownloads: null,
            moviesInProgress: {total: 0},
            snack: false,
            snackBarMessage: null,
            moviesInProgressLoading: false,
            currentDownloadsLoading: false,
            showRemoveDialog: false,
            downloadTaskIdToRemove: null,
            storage: null
        };

        props.changeNavigation('downloads');

    }

    /**
     * Resume a particular download
     * @param download
     * @returns {Promise<void>}
     */
    resumeDownload = async (download) => {

        try {
            switch (this.state.storage) {
                case 'gdrive':
                    await usersRef.child(await auth.getUid()).child('/settings/downloads/' + download.id).update({
                        event: 'resume'
                    });
                    this.setState({snack: true, snackBarMessage: 'Resumed'});
                    break;
                case 'nas':
                    this.setState({currentDownloadsLoading: true, currentDownloads: null});
                    let response = await fetch('/api/resume_download', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'token': await auth.getIdToken()
                        },
                        body: JSON.stringify({
                            id: download.id
                        })
                    });

                    response = await response.json();
                    this.setState({snack: true, snackBarMessage: 'Resumed'});
                    await this.loadCurrentDownloads();
                    break;
            }
        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error resuming this download'});
        }
    };

    /**
     * Pause a particular download
     * @param download
     * @returns {Promise<void>}
     */
    pauseDownload = async (download) => {
        try {
            switch (this.state.storage) {
                case 'gdrive':
                    await usersRef.child(await auth.getUid()).child('/settings/downloads/' + download.id).update({
                        event: 'pause'
                    });
                    this.setState({snack: true, snackBarMessage: 'Paused'});
                    break;
                case 'nas':
                    this.setState({currentDownloadsLoading: true, currentDownloads: null});
                    let response = await fetch('/api/pause_download', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'token': await auth.getIdToken()
                        },
                        body: JSON.stringify({
                            id: download.id
                        })
                    });
                    response = await response.json();
                    this.setState({snack: true, snackBarMessage: 'Paused'});
                    await this.loadCurrentDownloads();
                    break;
            }
        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error pausing this download'});
        }

    };

    /**
     * Remove a particular download
     * @returns {Promise<void>}
     */
    removeDownload = async () => {
        this.closeRemoveDialog();
        const download = this.state.downloadTaskIdToRemove;

        try {
            switch (this.state.storage) {
                case 'gdrive':

                    if (download.status === 'error') {
                        await usersRef.child(await auth.getUid()).child('/settings/downloads/' + download.id).remove();
                    } else if (download.status === 'finished') {
                        await usersRef.child(await auth.getUid()).child('/settings/downloads/' + download.id).remove();
                    } else {
                        await usersRef.child(await auth.getUid()).child('/settings/downloads/' + download.id).update({
                            event: 'destroy'
                        });
                    }

                    this.setState({snack: true, snackBarMessage: 'Removed'});
                    break;
                case 'nas':
                    let response = await fetch('/api/remove_download', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'token': await auth.getIdToken()
                        },
                        body: JSON.stringify({
                            id: download.id
                        })
                    });

                    response = await response.json();

                    this.setState({snack: true, snackBarMessage: 'Removed'});
                    await this.loadCurrentDownloads();
                    break;
            }
        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error removing this download'});
        }

    };

    /**
     * Clears every done downloads
     * @param event
     * @returns {Promise<void>}
     */
     clearDownloads = async (event) => {

         try {
             switch (this.state.storage) {
                 case 'gdrive':
                     const finishedDownloads = await usersRef.child(await auth.getUid()).child('/settings/downloads').orderByChild("status").equalTo('finished').once('value');

                     finishedDownloads.forEach(async finishedDownload => {
                         usersRef.child(await auth.getUid()).child('/settings/downloads').child(finishedDownload.val().id).remove();
                     });

                     console.log(finishedDownloads);
                     break;
                 case 'nas':
                     const downloadsToRemove = this.state.currentDownloads.tasks.filter(dl => dl.status === "finished").map(dl => dl.id).join(',');

                     if (downloadsToRemove.length > 0) {
                         this.setState({currentDownloadsLoading: true, currentDownloads: null});

                         try {
                             let response = await fetch('/api/remove_download', {
                                 method: 'POST',
                                 headers: {
                                     'Accept': 'application/json',
                                     'Content-Type': 'application/json',
                                     'token': await auth.getIdToken()
                                 },
                                 body: JSON.stringify({
                                     id: downloadsToRemove
                                 })
                             });

                             response = await response.json();

                             this.setState({snack: true, snackBarMessage: 'Removed'});

                         } catch(error) {
                             this.setState({snack: true, snackBarMessage: 'Error'});
                         }
                         await this.loadCurrentDownloads();
                     }
                     break;
             }
         } catch(error) {

         }

    };

    /**
     * Load all movies in progress - basically finding the best links before starting the download
     * @returns {Promise<void>}
     */
    loadMoviesInProgress = async () => {

        try {
            this.setState({moviesInProgressLoading: true});
            let response = await fetch('/api/movies_in_progress', {
                headers: {
                    'token': await auth.getIdToken()
                }
            });
            const moviesInProgress = await response.json();
            this.setState({moviesInProgress: moviesInProgress, moviesInProgressLoading: false})
        } catch(error) {
            this.setState({currentDownloads: null, snack: true, snackBarMessage: 'Error loading movies in progress', currentDownloadsLoading: false})
        }
    };

    /**
     * Load all current downloads for the downloader selected
     */
    loadCurrentDownloads = async () => {
        this.setState({currentDownloadsLoading: true, currentDownloads: null});

        try {
            const storage = await firebase.database().ref('/users').child(await auth.getUid()).child('/settings/storage').once('value');

            this.setState({storage: storage.val()});

            switch (storage.val()) {

                case 'gdrive':
                    firebase.database().ref('/users').child(await auth.getUid()).child('/settings/downloads').on('value', snapshot => {

                        const downloads = [];
                        snapshot.forEach(download => {
                            downloads.push(download.val());
                        });

                        this.setState({
                            currentDownloads: downloads
                        })
                    });

                    this.setState({
                        currentDownloadsLoading: false
                    });
                    break;
                case 'nas' :
                    let response = await fetch('/api/current_downloads', {
                        method: 'GET',
                        headers: {
                            'token': await auth.getIdToken()
                        }
                    });
                    const downloadsStates = await response.json();

                    if (downloadsStates.message) {
                        this.setState({currentDownloads: null, snack: true, snackBarMessage: 'error', currentDownloadsLoading: false})
                    } else {
                        this.setState({currentDownloads: downloadsStates.currentDownloads, currentDownloadsLoading: false})
                    }
                    break;
            }

            // firebase.database().ref('/users').child(await auth.getUid()).child('/settings/storage').on('value', snapshot => {
            //     console.log('new storage = ' + snapshot.val());
            // })

        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error while loading downloads', currentDownloadsLoading: false});
        }

    };

    /**
     * Remove a particular in progress movie
     */
    removeInProgressMovie = async (movie) => {

        try {
            let response = await fetch('/api/remove_in_progress_movie', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    movie: movie
                })
            });

            const moviesInProgress = await response.json();

            this.setState({moviesInProgress: moviesInProgress, snack: true, snackBarMessage: 'Movie removed'})
        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error removing the movie'});
        }
    };

    closeRemoveDialog = () => {
        this.setState({showRemoveDialog: false, downloadTaskIdToRemove: null})
    };

    showRemoveDialog = async (taskId) => {
        this.setState({showRemoveDialog: true, downloadTaskIdToRemove: taskId});
    };

    displaySnackMessage = message => {
        this.setState({snack: true, snackBarMessage: message});
    };


    render() {
        return (
            <div style={{marginBottom: '10vh'}}>

                <Snackbar

                    open={this.state.snack}
                    onClose={() => this.setState({snack: false})}
                    autoHideDuration={2000}
                    message={this.state.snackBarMessage}
                />

                <Dialog
                    open={this.state.showRemoveDialog}
                    onClose={this.closeRemoveDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">

                    <DialogTitle id="alert-dialog-title">Remove item</DialogTitle>

                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">Do you really want to remove this download task ?</DialogContentText>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={this.closeRemoveDialog} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.removeDownload} color="primary" autoFocus>
                            Remove
                        </Button>
                    </DialogActions>
                </Dialog>

                <h1>Downloads</h1>

                {/*Movies in progress*/}
                <ExpansionPanel onChange={(event, expanded) => expanded ? this.loadMoviesInProgress() : this.setState({moviesInProgress: {total: 0}})}>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Movies in progress</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails style={{textAlign: 'center'}}>

                        <List component="nav" style={{width: '100%'}}>

                            <CircularProgress style={this.state.moviesInProgressLoading ? {display: 'inline-block'} : {display: 'none'}} />

                            { this.state.moviesInProgress.total > 0 ? Object.keys(this.state.moviesInProgress.moviesInProgress).map(movieInProgress => {

                                const movie = this.state.moviesInProgress.moviesInProgress[movieInProgress];

                                return (
                                    <ListItem button>
                                        <ListItemText primary={movie.title}/>

                                        <ListItemSecondaryAction>
                                            {movie.state === 'error' ?
                                                <IconButton>
                                                    <Error style={{color: '#ff0000'}}/>
                                                </IconButton>
                                                :
                                                null
                                            }

                                            <IconButton>
                                                <Delete onClick={() => this.removeInProgressMovie(movie)} />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                )
                            })
                                :

                                <div style={this.state.moviesInProgressLoading ? {display: 'none'} : {padding: '10px', fontSize: '0.9rem', color: 'grey'}}>no movies in progress</div>

                                }

                        </List>

                    </ExpansionPanelDetails>
                </ExpansionPanel>


                {/*Current downloads*/}
                <ExpansionPanel onChange={(event, expanded) => expanded ? this.loadCurrentDownloads() : null}>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Current downloads</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails style={{textAlign: 'center', padding: '0'}}>

                        <List component="nav" style={{width: '100%'}}>

                            <CircularProgress style={this.state.currentDownloadsLoading ? {display: 'inline-block'} : {display: 'none'}} />

                            {this.state.currentDownloads !== null ? this.state.currentDownloads.length > 0 ? this.state.currentDownloads.map(currentDownload => {
                                return (
                                    <div>
                                        <div style={{display: 'inline-flex', width: '100%', textAlign: 'left', padding: '5px'}}>

                                            <div className="titleDownload">
                                                <p style={{fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{currentDownload.destination}</p>
                                            </div>

                                            <div style={{width: '8%', paddingTop: '12px'}}>
                                                <div>
                                                    {currentDownload.status === 'downloading' ?
                                                        <Download/>
                                                        :
                                                        currentDownload.status === 'error' ?
                                                            <ErrorRed/>
                                                            :
                                                            currentDownload.status === 'waiting' ?
                                                                <Delayed/>
                                                                :
                                                                currentDownload.status === 'finished' ?
                                                                    <DoneGreen/>
                                                                    :
                                                                    currentDownload.status === 'extracting' ?
                                                                        <Download/>
                                                                        :
                                                                        currentDownload.status === 'paused' ?
                                                                            <PauseFilled/>
                                                                            :
                                                                            currentDownload.status === 'finishing' ?
                                                                                <Download/>
                                                                                :
                                                                                null
                                                    }
                                                    </div>
                                            </div>

                                            <div>
                                                <p>{currentDownload.speed.toFixed(1)} Mo/s</p>
                                            </div>

                                            <div style={{textAlign: 'center'}} className="buttonsDownload">
                                                <IconButton style={{padding: '5px'}} disabled={currentDownload.status !== 'paused'}>
                                                    <PlayCircle onClick={() => this.resumeDownload(currentDownload)}/>
                                                </IconButton>

                                                <IconButton style={{padding: '5px'}} disabled={currentDownload.status !== 'finishing' && currentDownload.status !== 'extracting' && currentDownload.status !== 'downloading'}>
                                                    <PauseCircle onClick={() => this.pauseDownload(currentDownload)}/>
                                                </IconButton>

                                                <IconButton style={{padding: '5px'}}>
                                                    <RemoveCircle  onClick={() => this.showRemoveDialog(currentDownload)}/>
                                                </IconButton>
                                            </div>

                                        </div>

                                        <div style={{paddingRight: '5px', paddingLeft: '5px'}}>
                                            <LinearProgress variant="determinate" value={Math.round(currentDownload.size_downloaded*100 / currentDownload.size)} />
                                        </div>

                                    </div>
                                )
                            })
                                :

                                <div style={{padding: '10px', fontSize: '0.9rem', color: 'grey'}}>no current download</div>

                                :

                                null}

                        </List>

                    </ExpansionPanelDetails>

                    {this.state.currentDownloads !== null ? this.state.currentDownloads.length > 0 ?

                        <ExpansionPanelActions>
                            <Button size="small"><Clear onClick={(event) => this.clearDownloads(event)}/></Button>
                        </ExpansionPanelActions>

                        :

                        null

                        :

                        null
                    }
                </ExpansionPanel>


                <Torrents
                    displaySnackMessage={this.displaySnackMessage}
                />


            </div>
        )
    }

}

export default Downloads

function DoneGreen(props) {
    return (
        <Done style={{color: '#4CAF50'}}/>
    )
}

function ErrorRed(props) {
    return(
        <Error style={{color: '#ff0000'}}/>
    )
}