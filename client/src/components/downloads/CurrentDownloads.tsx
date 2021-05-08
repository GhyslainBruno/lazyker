import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import List from "@material-ui/core/List";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import Error from "@material-ui/icons/Error";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import React from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
import PlayCircle from "@material-ui/icons/PlayCircleOutline";
import PauseCircle from "@material-ui/icons/PauseCircleOutline";
import RemoveCircle from "@material-ui/icons/RemoveCircleOutline";
import Download from "@material-ui/icons/GetApp";
import Delayed from "@material-ui/icons/WatchLater";
import PauseFilled from "@material-ui/icons/PauseCircleFilled";
import Done from "@material-ui/icons/CheckCircle";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Clear from '@material-ui/icons/ClearAll';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import * as auth from "../../firebase/auth";
import firebase from "firebase";


const usersRef = firebase.database().ref('/users');

type MyProps = {
    displaySnackMessage: (message: string) => void;
};
type MyState = {
    currentDownloads: any;
    snack: boolean;
    snackBarMessage: null | string;
    currentDownloadsLoading: boolean;
    showRemoveDialog: boolean;
    downloadTaskIdToRemove: any;
    storage: any;
};

class CurrentDownloads extends React.Component<MyProps, MyState> {

    constructor(props: any)
    {
        super(props);
        this.state = {
            currentDownloads: null,
            snack: false,
            snackBarMessage: null,
            currentDownloadsLoading: false,
            showRemoveDialog: false,
            downloadTaskIdToRemove: null,
            storage: null
        };
    }

    /**
     * Resume a particular download
     * @param download
     * @returns {Promise<void>}
     */
    resumeDownload = async (download: any) => {

        try {
            switch (this.state.storage) {
                case 'gdrive':
                    await usersRef.child(await auth.getUid()).child('/settings/downloads/' + download.id).update({
                        event: 'resume'
                    });
                    // this.setState({snack: true, snackBarMessage: 'Resumed'});
                    this.props.displaySnackMessage('Resumed');
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
                    // this.setState({snack: true, snackBarMessage: 'Resumed'});
                    this.props.displaySnackMessage('Resumed');
                    await this.loadCurrentDownloads();
                    break;
            }
        } catch(error) {
            // this.setState({snack: true, snackBarMessage: 'Error resuming this download'});
            this.props.displaySnackMessage('Error resuming this download');
        }
    };

    /**
     * Pause a particular download
     * @param download
     * @returns {Promise<void>}
     */
    pauseDownload = async (download: any) => {
        try {
            switch (this.state.storage) {
                case 'gdrive':
                    await usersRef.child(await auth.getUid()).child('/settings/downloads/' + download.id).update({
                        event: 'pause'
                    });
                    this.props.displaySnackMessage('Paused');
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
                    this.props.displaySnackMessage('Paused');
                    await this.loadCurrentDownloads();
                    break;
            }
        } catch(error) {
            this.props.displaySnackMessage('Error pausing this download');
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
                    this.props.displaySnackMessage('Removed');
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

                    this.props.displaySnackMessage('Removed');
                    await this.loadCurrentDownloads();
                    break;
            }
        } catch(error) {
            this.props.displaySnackMessage('Error removing this download');
        }

    };

    /**
     * Clears every done downloads
     * @param event
     * @returns {Promise<void>}
     */
    clearDownloads = async (event: any) => {

        try {
            switch (this.state.storage) {
                case 'gdrive':
                    const finishedDownloads = await usersRef.child(await auth.getUid()).child('/settings/downloads').orderByChild("status").equalTo('finished').once('value');

                    for (let finishedDownload in finishedDownloads.val()) {

                        usersRef.child(await auth.getUid()).child('/settings/downloads').child(finishedDownload).remove();
                    }

                    const errorDownloads = await usersRef.child(await auth.getUid()).child('/settings/downloads').orderByChild("status").equalTo('error').once('value');

                    for (let errorDownload in errorDownloads.val()) {

                        usersRef.child(await auth.getUid()).child('/settings/downloads').child(errorDownload).remove();
                    }

                    this.props.displaySnackMessage('Downloads cleared');
                    break;
                case 'nas':
                    const downloadsToRemove = this.state.currentDownloads.tasks.filter((dl: any) => dl.status === "finished").map((dl: any) => dl.id).join(',');

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

                            this.props.displaySnackMessage('Removed');

                        } catch(error) {
                            this.props.displaySnackMessage('Error');
                        }
                        await this.loadCurrentDownloads();
                    }
                    break;
            }
        } catch(error) {

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
                    firebase.database().ref('/users').child(await auth.getUid()).child('/settings/downloads').on('value', (snapshot: any) => {

                        const downloads: [] = [];

                        snapshot.forEach((download: any) => {
                            // @ts-ignore
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
                        this.props.displaySnackMessage('Error');
                        this.setState({currentDownloads: null, currentDownloadsLoading: false})
                    } else {
                        this.setState({currentDownloads: downloadsStates.currentDownloads, currentDownloadsLoading: false})
                    }
                    break;

                default :
                    this.props.displaySnackMessage('Error : No Storage selected (go to Settings > Configuration)');
                    this.setState({
                        currentDownloads: [],
                        currentDownloadsLoading: false
                    });
                    break;
            }

            // firebase.database().ref('/users').child(await auth.getUid()).child('/settings/storage').on('value', snapshot => {
            //     console.log('new storage = ' + snapshot.val());
            // })

        } catch(error) {
            this.setState({currentDownloadsLoading: false, currentDownloads: null});
            this.props.displaySnackMessage('Error while loading downloads');
        }

    };

    closeRemoveDialog = () => {
        this.setState({showRemoveDialog: false, downloadTaskIdToRemove: null})
    };

    showRemoveDialog = async (taskId: any) => {
        this.setState({showRemoveDialog: true, downloadTaskIdToRemove: taskId});
    };

    render() {
        return (

            <ExpansionPanel onChange={(event, expanded) => expanded ? this.loadCurrentDownloads() : null}>

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

                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Current downloads</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{textAlign: 'center'}}>

                    <List component="nav" style={{width: '100%'}}>

                        <CircularProgress style={this.state.currentDownloadsLoading ? {display: 'inline-block'} : {display: 'none'}} />

                        {this.state.currentDownloads !== null ? this.state.currentDownloads.length > 0 ? this.state.currentDownloads.map((currentDownload: any) => {
                                return (
                                    <div>
                                        <div style={{display: 'flex', width: '100%', textAlign: 'left', padding: '5px', flexWrap: 'wrap', justifyContent: 'space-between'}}>

                                            {/* Title */}
                                            <div className="titleDownload">
                                                <p style={{fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{currentDownload.destination}</p>
                                            </div>

                                            <div className="actionDownload">
                                                {/* State icon */}
                                                <div style={{width: '8%', padding: '12px', textAlign: 'center'}}>
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

                                                {/* Speed */}
                                                <div style={{paddingLeft: '10px', paddingRight: '10px'}}>
                                                    <p>{currentDownload.speed.toFixed(1).padStart(4, '0')} Mo/s</p>
                                                </div>

                                                {/* Download buttons */}
                                                <div style={{textAlign: 'center', margin: 'auto'}} className="buttonsDownload">
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

                                        </div>

                                        <LinearProgress variant="determinate" value={Math.round(currentDownload.size_downloaded*100 / currentDownload.size)} />
                                        {/*<div style={{paddingRight: '5px', paddingLeft: '5px'}}>*/}
                                            {/*<LinearProgress variant="determinate" value={Math.round(currentDownload.size_downloaded*100 / currentDownload.size)} />*/}
                                        {/*</div>*/}

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
        )
    }
}

export default CurrentDownloads

function DoneGreen(props: any) {
    return (
        <Done style={{color: '#4CAF50'}}/>
    )
}

function ErrorRed(props: any) {
    return(
        <Error style={{color: '#ff0000'}}/>
    )
}
