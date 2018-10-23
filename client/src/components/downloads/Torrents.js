import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import List from "@material-ui/core/List";
import CircularProgress from "@material-ui/core/CircularProgress";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import Error from "@material-ui/icons/Error";
import Delete from "@material-ui/icons/Delete";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import React from "react";
import Downloads from "../Downloads";
import LinearProgress from "@material-ui/core/LinearProgress";
import PlayCircle from "@material-ui/icons/PlayCircleOutline";
import PlayArrow from "@material-ui/icons/PlayArrow";
import PauseCircle from "@material-ui/icons/PauseCircleOutline";
import RemoveCircle from "@material-ui/icons/RemoveCircleOutline";
import Download from "@material-ui/icons/GetApp";
import Delayed from "@material-ui/icons/WatchLater";
import PauseFilled from "@material-ui/icons/PauseCircleFilled";
import Done from "@material-ui/icons/CheckCircle";
import CloudDownload from "@material-ui/icons/CloudDownload"
import CloudDone from "@material-ui/icons/CloudDone"
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import * as auth from "../../firebase/auth";

function CloudDoneGreen(props) {
    return (
        <CloudDone style={{color: '#4CAF50'}}/>
    )
}

function ErrorRed(props) {
    return(
        <Error style={{color: '#ff0000'}}/>
    )
}

class Torrents extends React.Component {

    constructor(props)
    {
        super(props);
        this.state = {
            torrents: null,
            torrentsLoading: false,
            torrentIdToRemove: null,
            showDeleteDialog: false
        };
    }

    loadTorrents = async () => {
        this.setState({torrentsLoading: true, torrents: null});

        try {
            let response = await fetch('/api/realdebrid_torrents', {
                method: 'GET',
                headers: {
                    'token': await auth.getIdToken()
                }
            });
            const torrents = await response.json();
            this.setState({torrents: torrents, torrentsLoading: false})
        } catch(error) {
            this.props.displaySnackMessage('Error getting Realdebrid torrents');
            this.setState({torrentsLoading: false});
        }
    };

    showDeleteDialog = async (torrentId) => {
        this.setState({showDeleteDialog: true, torrentIdToRemove: torrentId});
    };

    closeDeleteDialog = () => {
        this.setState({showDeleteDialog: false, torrentIdToRemove: null})
    };

    deleteTorrent = async () => {
        this.setState({torrentsLoading: true, torrents: null, showDeleteDialog: false});

        try {
            let response = await fetch('/api/realdebrid_torrents?torrentId=' + this.state.torrentIdToRemove, {
                method: 'DELETE',
                headers: {
                    'token': await auth.getIdToken()
                }
            });
            const torrents = await response.json();
            // this.setState({torrents: torrents, torrentsLoading: false})
            this.loadTorrents();
        } catch(error) {
            this.props.displaySnackMessage('Error getting Realdebrid torrents');
            this.setState({torrentsLoading: false});
        }
    };

    startTorrentStreaming = async torrent => {
        try {
            let response = await fetch('/api/streaming_torrent', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    link: torrent.links[0]
                })
            });
            response = await response.json();

            if (response.error) {
                this.props.displaySnackMessage('File not streamable');
            } else {
                window.location = response.streamingLink;
            }
        } catch (error) {
            this.props.displaySnackMessage('Impossible to stream this torrent');
        }
    };

    startTorrentDownload = async torrent => {
        this.setState({torrentsLoading: true, torrents: null, showDeleteDialog: false});

        try {
            let response = await fetch('/api/realdebrid_torrent_download', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    torrent: torrent
                })
            });
            response = await response.json();
            if (response.message !== 'ok') {
                this.props.displaySnackMessage('Error downloading this Realdebrid torrents');
                this.loadTorrents();
            } else {
                this.props.displaySnackMessage('Added to current downloads');
                this.loadTorrents();
            }

        } catch(error) {
            this.props.displaySnackMessage('Error downloading this Realdebrid torrents');
            this.loadTorrents();
        }
    };

    render() {
        return (

            <div>
                <Dialog
                    open={this.state.showDeleteDialog}
                    onClose={this.closeDeleteDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">

                    <DialogTitle id="alert-dialog-title">Remove item</DialogTitle>

                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">Do you really want to remove this download task ?</DialogContentText>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={this.closeDeleteDialog} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.deleteTorrent} color="primary" autoFocus>
                            Remove
                        </Button>
                    </DialogActions>
                </Dialog>

                <ExpansionPanel onChange={(event, expanded) => expanded ? this.loadTorrents() : null}>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>RealDebrid Torrents</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails style={{textAlign: 'center'}}>

                        <List component="nav" style={{width: '100%'}}>

                            <CircularProgress style={this.state.torrentsLoading ? {display: 'inline-block'} : {display: 'none'}} />

                            {this.state.torrents !== null ? this.state.torrents.length > 0 ? this.state.torrents.map(torrent => {
                                    return (

                                        <div>
                                            <div style={{display: 'inline-flex', width: '100%', textAlign: 'left', padding: '5px'}}>
                                                <div className="titleDownload">
                                                    <p style={{fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{torrent.filename}</p>
                                                </div>

                                                <div style={{width: '8%', paddingTop: '12px'}}>
                                                    <div>
                                                        {(torrent.status === 'downloading' ||
                                                            torrent.status === 'uploading'
                                                        )?
                                                            <CloudDownload/>
                                                            :
                                                            (torrent.status === 'error' ||
                                                                torrent.status === 'magnet_error' ||
                                                                torrent.status === 'virus'
                                                            ) ?
                                                                <ErrorRed/>
                                                                :
                                                                (torrent.status === 'waiting_files_selection' ||
                                                                    torrent.status === 'magnet_conversion' ||
                                                                    torrent.status === 'queued'
                                                                ) ?
                                                                    <Delayed/>
                                                                    :
                                                                    torrent.status === 'downloaded' ?
                                                                        <CloudDoneGreen/>
                                                                        :
                                                                        torrent.status === 'compressing' ?
                                                                            <CloudDownload/>
                                                                            :
                                                                            torrent.status === 'dead' ?
                                                                                <ErrorRed/>
                                                                                :
                                                                                null
                                                        }
                                                    </div>
                                                </div>

                                                <div style={{textAlign: 'center'}} className="buttonsDownload">
                                                    <IconButton style={{padding: '5px'}}>
                                                        <RemoveCircle onClick={() => this.showDeleteDialog(torrent.id)}/>
                                                    </IconButton>

                                                    <IconButton style={{padding: '5px'}} disabled={torrent.status !== 'downloaded'}>
                                                        <Download onClick={() => this.startTorrentDownload(torrent)}/>
                                                    </IconButton>

                                                    {/* TODO: use a generic streaming url (not only realdebrid service) */}
                                                    <IconButton style={{padding: '5px'}} disabled={torrent.status !== 'downloaded'} onClick={() => this.startTorrentStreaming(torrent)}>
                                                        <PlayArrow/>
                                                    </IconButton>

                                                    {/*<IconButton style={{padding: '5px'}}>*/}
                                                    {/*<RemoveCircle  onClick={() => this.showRemoveDialog(currentDownload.id)}/>*/}
                                                    {/*</IconButton>*/}
                                                </div>
                                            </div>

                                            <div style={{paddingRight: '5px', paddingLeft: '5px'}}>
                                                <LinearProgress variant="determinate" value={torrent.progress} />
                                            </div>
                                        </div>

                                        // <ListItem button>
                                        //     <ListItemText primary={torrent.filename}/>
                                        //
                                        //     <div style={{paddingRight: '5px', paddingLeft: '5px'}}>
                                        //         <LinearProgress variant="determinate" value={50} />
                                        //     </div>
                                        //
                                        //     <ListItemSecondaryAction>
                                        //         {torrent.status === 'error' ?
                                        //             <IconButton>
                                        //                 <Error style={{color: '#ff0000'}}/>
                                        //             </IconButton>
                                        //             :
                                        //             null
                                        //         }
                                        //
                                        //         <IconButton>
                                        //             <Delete onClick={() => this.deleteTorrent(torrent)} />
                                        //         </IconButton>
                                        //     </ListItemSecondaryAction>
                                        // </ListItem>
                                    )
                                })

                                :

                                <div style={{padding: '10px', fontSize: '0.9rem', color: 'grey'}}>no torrents</div>

                                :

                                null}

                        </List>

                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div>
        )
    }
}

export default Torrents