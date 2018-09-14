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
            downloadTaskIdToRemove: null
        };

        props.changeNavigation('downloads');

    }

    resumeDownload = async (downloadId) => {
        this.setState({currentDownloadsLoading: true, currentDownloads: null});
        try {
            let response = await fetch('/api/resume_download', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: downloadId
                })
            });

            response = await response.json();

            this.setState({snack: true, snackBarMessage: 'Resumed'});

        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error'});
        }
        await this.loadCurrentDownloads();
    };

    pauseDownload = async (downloadId) => {
        this.setState({currentDownloadsLoading: true, currentDownloads: null});
        try {
            let response = await fetch('/api/pause_download', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: downloadId
                })
            });

            response = await response.json();

            this.setState({snack: true, snackBarMessage: 'Paused'});

        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error'});
        }
        await this.loadCurrentDownloads();
    };

    removeDownload = async () => {

        this.closeRemoveDialog();

        const downloadId = this.state.downloadTaskIdToRemove;

        this.setState({currentDownloadsLoading: true, currentDownloads: null});
        try {
            let response = await fetch('/api/remove_download', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: downloadId
                })
            });

            response = await response.json();

            this.setState({snack: true, snackBarMessage: 'Removed'});

        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error'});
        }
        await this.loadCurrentDownloads();
    };

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

    loadCurrentDownloads = async () => {
        this.setState({currentDownloadsLoading: true, currentDownloads: null});

        try {
            let response = await fetch('/api/current_downloads');
            const downloadsStates = await response.json();

            if (downloadsStates.message) {
                this.setState({currentDownloads: null, snack: true, snackBarMessage: 'error', currentDownloadsLoading: false})
            } else {
                this.setState({currentDownloads: downloadsStates.currentDownloads, currentDownloadsLoading: false})
            }
            
        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'error', currentDownloadsLoading: false});
        }
    };

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

    clearDownloads = async (event) => {
        const downloadsToRemove = this.state.currentDownloads.tasks.filter(dl => dl.status === "finished").map(dl => dl.id).join(',');

        if (downloadsToRemove.length > 0) {
            this.setState({currentDownloadsLoading: true, currentDownloads: null});

            try {
                let response = await fetch('/api/remove_download', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
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
    };

    displaySnackMessage = message => {
        this.setState({snack: true, snackBarMessage: message});
    };


    render() {
        return (
            <div>

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

                            {this.state.currentDownloads !== null ? this.state.currentDownloads.tasks.length > 0 ? this.state.currentDownloads.tasks.map(currentDownload => {
                                return (
                                    <div>
                                        <div style={{display: 'inline-flex', width: '100%', textAlign: 'left', padding: '5px'}}>

                                            <div className="titleDownload">
                                                <p style={{fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{currentDownload.additional.detail.destination}</p>
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

                                            <div style={{textAlign: 'center'}} className="buttonsDownload">
                                                <IconButton style={{padding: '5px'}} disabled={currentDownload.status !== 'paused'}>
                                                    <PlayCircle onClick={() => this.resumeDownload(currentDownload.id)}/>
                                                </IconButton>

                                                <IconButton style={{padding: '5px'}} disabled={currentDownload.status !== 'finishing' && currentDownload.status !== 'extracting' && currentDownload.status !== 'downloading'}>
                                                    <PauseCircle onClick={() => this.pauseDownload(currentDownload.id)}/>
                                                </IconButton>

                                                <IconButton style={{padding: '5px'}}>
                                                    <RemoveCircle  onClick={() => this.showRemoveDialog(currentDownload.id)}/>
                                                </IconButton>
                                            </div>
                                        </div>

                                        <div style={{paddingRight: '5px', paddingLeft: '5px'}}>
                                            <LinearProgress variant="determinate" value={Math.round((1-((currentDownload.size - currentDownload.additional.transfer.size_downloaded) / currentDownload.size))*100)} />
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

                    {this.state.currentDownloads !== null ? this.state.currentDownloads.tasks.length > 0 ?

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