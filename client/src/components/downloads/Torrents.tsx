import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import List from "@material-ui/core/List";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import Error from "@material-ui/icons/Error";
import Accordion from "@material-ui/core/Accordion";
import React, {useEffect, useState} from "react";
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
import {useDispatch} from 'react-redux';
import {displayErrorNotification, displaySuccessNotification} from '../../ducks/snack/Snackbar.slice';
import * as auth from "../../firebase/auth";
import Tooltip from '@material-ui/core/Tooltip';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';


const CloudDoneGreen = (props: any) => {
    return (
        <CloudDone style={{color: '#4CAF50'}}/>
    )
}

const ErrorRed = (props: any) => {
    return(
        <Error style={{color: '#ff0000'}}/>
    )
}

type TorrentsProps = {
    displaySnackMessage: (message: string) => void;
};

type TorrentsState = {
    torrents: any;
    torrentsLoading: boolean;
    torrentIdToRemove: any;
    showDeleteDialog: boolean;
    open: any;
    torrentsInterval: any;
};

interface StreamingTorrentDto {
    error: any;
    streamingLink: any;
}

interface StartTorrentDownloadDto {
    message: string;
}

const Torrents = (props: TorrentsProps, state: TorrentsState) => {

    const [torrents, setTorrents] = useState<any>(null);
    const [torrentsLoading, setTorrentsLoading] = useState(false);
    const [torrentIdToRemove, setTorrentIdToRemove] = useState(null);
    const [showDeleteDialogState, setShowDeleteDialog] = useState(false);
    const [open, setOpen] = useState(false);
    const [torrentsInterval, setTorrentsInterval] = useState<any>('torrentsInterval');

    const dispatch = useDispatch();

    useEffect(() => {
        stopsRealTimeTorrents();
    }, []);

    const firstTorrentsLoad = async () => {
        setTorrentsLoading(true);
        setTorrents(null);

        try {
            let response = await fetch('/api/realdebrid_torrents', {
                method: 'GET',
                headers: {
                    'token': await auth.getIdToken()
                }
            });

            loadRealTimeTorrents();

            if (response.status === 200) {
                const torrents = await response.json();
                setTorrents(torrents);
                setTorrentsLoading(false);
            } else {
                setTorrents([]);
                setTorrentsLoading(false);
                dispatch(displayErrorNotification('Link your debrider account in Settings'));
            }

        } catch(error) {
            dispatch(displayErrorNotification('Error getting Realdebrid torrents'));
            setTorrentsLoading(false);
        }
    };

    const loadRealTimeTorrents = () => {

        setTorrentsInterval(setInterval(async () => {
            try {
                let response = await fetch('/api/realdebrid_torrents', {
                    method: 'GET',
                    headers: {
                        'token': await auth.getIdToken()
                    }
                });

                if (response.status === 200) {
                    const torrents = await response.json();
                    setTorrents(torrents);
                } else {
                    setTorrents([]);
                    setTorrentsLoading(false);
                    dispatch(displayErrorNotification('Link your debrider account in Settings'));
                }

            } catch(error) {
                dispatch(displayErrorNotification('Error getting Realdebrid torrents'));
                setTorrentsLoading(false);
            }
        }, 4000))

        // this.setState({
        //     torrentsInterval: setInterval(async () => {
        //         try {
        //             let response = await fetch('/api/realdebrid_torrents', {
        //                 method: 'GET',
        //                 headers: {
        //                     'token': await auth.getIdToken()
        //                 }
        //             });
        //
        //             if (response.status === 200) {
        //                 const torrents = await response.json();
        //                 this.setState({ torrents: torrents });
        //             } else {
        //                 this.setState({ torrents: [], torrentsLoading: false });
        //                 this.props.displaySnackMessage('Error : Link your InterfaceDebrider account -> Settings > Configuration');
        //             }
        //
        //         } catch(error) {
        //             this.props.displaySnackMessage('Error getting Realdebrid torrents');
        //             this.setState({torrentsLoading: false});
        //         }
        //     }, 4000)
        // })
    };

    const stopsRealTimeTorrents = () => {
        clearInterval(torrentsInterval);
    };

    const showDeleteDialog = async (torrentId: any) => {
        setShowDeleteDialog(true);
        setTorrentIdToRemove(torrentId);
    };

    const closeDeleteDialog = () => {
        setShowDeleteDialog(false);
        setTorrentIdToRemove(null);
    };

    const deleteTorrent = async () => {
        setTorrentsLoading(true);
        setTorrents(null);
        setShowDeleteDialog(false);

        try {
            await fetch('/api/realdebrid_torrents?torrentId=' + torrentIdToRemove, {
                method: 'DELETE',
                headers: {
                    'token': await auth.getIdToken()
                }
            });
            setTorrentsLoading(false);
        } catch(error) {
            dispatch(displayErrorNotification('Error while deleting your torrent'));
            setTorrentsLoading(false);
        }
    };

    const startTorrentStreaming = async (torrent: any) => {
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
            const responseJSON: StreamingTorrentDto = await response.json();

            if (responseJSON.error) {
                dispatch(displayErrorNotification('File not streamable'));
            } else {
                window.location = responseJSON.streamingLink;
            }
        } catch (error) {
            dispatch(displayErrorNotification('Impossible to stream this torrent'));
        }
    };

    const startTorrentDownload = async (torrent: any) => {
        setTorrentsLoading(true);
        setTorrents(null);
        setShowDeleteDialog(false);

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
            const responseJSON: StartTorrentDownloadDto = await response.json();

            if (responseJSON.message !== 'ok') {
                dispatch(displayErrorNotification(responseJSON.message));
                setTorrentsLoading(false);
            } else {
                dispatch(displaySuccessNotification('Added to current downloads'));
                setTorrentsLoading(false);
            }

        } catch(error) {
            setTorrentsLoading(false);
            dispatch(displayErrorNotification(error.message));
        }
    };

    return (
      <Accordion onChange={(event, expanded) => expanded ? firstTorrentsLoad() : stopsRealTimeTorrents()}>

          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>RealDebrid Torrents</Typography>
          </AccordionSummary>

          <Dialog
            open={showDeleteDialogState}
            onClose={closeDeleteDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">

              <DialogTitle id="alert-dialog-title">Remove item</DialogTitle>

              <DialogContent>
                  <DialogContentText id="alert-dialog-description">Do you really want to remove this torrent ?</DialogContentText>
              </DialogContent>

              <DialogActions>
                  <Button onClick={closeDeleteDialog} color="primary">
                      Cancel
                  </Button>
                  <Button onClick={deleteTorrent} color="primary" autoFocus>
                      Remove
                  </Button>
              </DialogActions>
          </Dialog>

          <AccordionDetails style={{textAlign: 'center'}}>

              <List component="nav" style={{width: '100%'}}>

                  <CircularProgress style={torrentsLoading ? {display: 'inline-block'} : {display: 'none'}} />

                  {torrents !== null ?
                    torrents.length > 0 ?
                      !torrentsLoading ?
                        torrents.map((torrent: any) => {
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
                                              <RemoveCircle onClick={() => showDeleteDialog(torrent.id)}/>
                                          </IconButton>

                                          <IconButton style={{padding: '5px'}} disabled={torrent.status !== 'downloaded'}>
                                              <Download onClick={() => startTorrentDownload(torrent)}/>
                                          </IconButton>

                                          {/* TODO: use a generic streaming url (not only realdebrid service) */}
                                          <IconButton style={{padding: '5px'}} disabled={torrent.status !== 'downloaded'} onClick={() => startTorrentStreaming(torrent)}>
                                              <PlayArrow/>
                                          </IconButton>
                                      </div>
                                  </div>

                                  <div style={{paddingRight: '5px', paddingLeft: '5px'}}>
                                      <LinearProgress variant="determinate" value={torrent.progress} />
                                  </div>
                              </div>
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

          </AccordionDetails>
      </Accordion>
    )
}

export default Torrents
