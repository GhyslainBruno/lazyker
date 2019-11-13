import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
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
import PlayArrow from "@material-ui/icons/PlayArrow";
import RemoveCircle from "@material-ui/icons/RemoveCircleOutline";
import Download from "@material-ui/icons/GetApp";
import Delayed from "@material-ui/icons/WatchLater";
import CloudDownload from "@material-ui/icons/CloudDownload"
import CloudDone from "@material-ui/icons/CloudDone"
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import * as auth from "../../firebase/auth";
import Tooltip from '@material-ui/core/Tooltip';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';


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
            showDeleteDialog: false,
            open: false,
            torrentsInterval: 'torrentsInterval'
        };
    }

    componentWillUnmount() {
        this.stopsRealTimeTorrents();
    }

    handleTooltipClose = () => {
        this.setState({ open: false });
    };

    handleTooltipOpen = () => {
        this.setState({ open: true });
    };

    firstTorrentsLoad = async () => {
        this.setState({torrentsLoading: true, torrents: null});

        try {
            let response = await fetch('/api/realdebrid_torrents', {
                method: 'GET',
                headers: {
                    'token': await auth.getIdToken()
                }
            });

            this.loadRealTimeTorrents();

            if (response.status === 200) {
                const torrents = await response.json();
                this.setState({torrents: torrents, torrentsLoading: false});
            } else {
                this.setState({torrents: [], torrentsLoading: false});
                this.props.displaySnackMessage('Error : Link your Debrider account -> Settings > Configuration');
            }

        } catch(error) {
            this.props.displaySnackMessage('Error getting Realdebrid torrents');
            this.setState({torrentsLoading: false});
        }
    };

    loadTorrents = async () => {
        this.setState({torrentsLoading: true, torrents: null});

        try {
            let response = await fetch('/api/realdebrid_torrents', {
                method: 'GET',
                headers: {
                    'token': await auth.getIdToken()
                }
            });

            if (response.status === 200) {
                const torrents = await response.json();
                this.setState({torrents: torrents, torrentsLoading: false});
            } else {
                this.setState({torrents: [], torrentsLoading: false});
                this.props.displaySnackMessage('Error : Link your Debrider account -> Settings > Configuration');
            }

        } catch(error) {
            this.props.displaySnackMessage('Error getting Realdebrid torrents');
            this.setState({torrentsLoading: false});
        }
    };

    loadRealTimeTorrents = () => {
         this.state.torrentsInterval = setInterval(async () => {
             try {
                 let response = await fetch('/api/realdebrid_torrents', {
                     method: 'GET',
                     headers: {
                         'token': await auth.getIdToken()
                     }
                 });

                 if (response.status === 200) {
                     const torrents = await response.json();
                     this.setState({ torrents: torrents });
                 } else {
                     this.setState({ torrents: [], torrentsLoading: false });
                     this.props.displaySnackMessage('Error : Link your Debrider account -> Settings > Configuration');
                 }

             } catch(error) {
                 this.props.displaySnackMessage('Error getting Realdebrid torrents');
                 this.setState({torrentsLoading: false});
             }
         }, 4000)
    };

    stopsRealTimeTorrents = () => {
        clearInterval(this.state.torrentsInterval);
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
            await fetch('/api/realdebrid_torrents?torrentId=' + this.state.torrentIdToRemove, {
                method: 'DELETE',
                headers: {
                    'token': await auth.getIdToken()
                }
            });
            // const torrents = await response.json();
            // this.setState({torrents: torrents, torrentsLoading: false})
            this.setState({torrentsLoading: false});
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
                this.props.displaySnackMessage(response.message);
                this.setState({torrentsLoading: false});
                // this.loadTorrents();
            } else {
                this.props.displaySnackMessage('Added to current downloads');
                this.setState({torrentsLoading: false});
                // this.loadTorrents();
            }

        } catch(error) {
            this.setState({torrentsLoading: false});
            this.props.displaySnackMessage(error.message);
            // this.loadTorrents();
        }
    };

    render() {
        return (

            <ExpansionPanel onChange={(event, expanded) => expanded ? this.firstTorrentsLoad() : this.stopsRealTimeTorrents()}>

                <Dialog
                    open={this.state.showDeleteDialog}
                    onClose={this.closeDeleteDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">

                    <DialogTitle id="alert-dialog-title">Remove item</DialogTitle>

                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">Do you really want to remove this torrent ?</DialogContentText>
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

                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>RealDebrid Torrents</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{textAlign: 'center'}}>

                    <List component="nav" style={{width: '100%'}}>

                        <CircularProgress style={this.state.torrentsLoading ? {display: 'inline-block'} : {display: 'none'}} />

                        {this.state.torrents !== null ?
                            this.state.torrents.length > 0 ?
                                !this.state.torrentsLoading ?
                                    this.state.torrents.map(torrent => {
                                        return (
                                            <div>
                                                <div style={{display: 'inline-flex', width: '100%', textAlign: 'left', padding: '5px'}}>
                                                    <div className="torrentsTitlesDownload" style={{flex: '1'}}>

                                                        {/* Trying to use click tooltip, not functional for now */}
                                                        {/*<ClickAwayListener onClickAway={this.handleTooltipClose}>*/}
                                                        {/*<div>*/}
                                                        {/*<Tooltip*/}
                                                        {/*PopperProps={{*/}
                                                        {/*disablePortal: false,*/}
                                                        {/*}}*/}
                                                        {/*onClose={this.handleTooltipClose}*/}
                                                        {/*open={this.state.open}*/}
                                                        {/*disableFocusListener*/}
                                                        {/*disableHoverListener*/}
                                                        {/*disableTouchListener*/}
                                                        {/*title={torrent.filename}*/}
                                                        {/*>*/}
                                                        {/*<p style={{fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} onClick={this.handleTooltipOpen}>{torrent.filename}</p>*/}
                                                        {/*</Tooltip>*/}
                                                        {/*</div>*/}
                                                        {/*</ClickAwayListener>*/}

                                                        <Tooltip title={torrent.filename}>
                                                            <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{torrent.filename}</p>
                                                        </Tooltip>

                                                        {/* Without any tooltip - old way */}
                                                        {/*<p style={{fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{torrent.filename}</p>*/}
                                                    </div>

                                                    <div style={{width: '8%', padding: '12px', textAlign: 'center'}}>
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

                                                    <div style={{textAlign: 'center', margin: 'auto'}} className="buttonsDownload">
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
                                    null
                                :
                                <div style={{padding: '10px', fontSize: '0.9rem', color: 'grey'}}>no torrents</div>
                            :
                            null
                        }

                    </List>

                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }
}

export default Torrents
