import Accordion from "@material-ui/core/Accordion";
import AccordionActions from '@material-ui/core/AccordionActions';
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import LinearProgress from "@material-ui/core/LinearProgress";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Done from "@material-ui/icons/CheckCircle";
import Clear from '@material-ui/icons/ClearAll';
import Error from "@material-ui/icons/Error";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Download from "@material-ui/icons/GetApp";
import PauseFilled from "@material-ui/icons/PauseCircleFilled";
import PauseCircle from "@material-ui/icons/PauseCircleOutline";
import PlayCircle from "@material-ui/icons/PlayCircleOutline";
import RemoveCircle from "@material-ui/icons/RemoveCircleOutline";
import Delayed from "@material-ui/icons/WatchLater";
import firebase from 'firebase/app';
import 'firebase/database';
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from 'react-redux';
import {displayErrorNotification, displaySuccessNotification} from '../../ducks/snack/Snackbar.slice';
import {StorageEnum} from '../../ducks/storages/Storage.enum';
import {fetchStorage, getStorageSelected, updateStorage} from '../../ducks/storages/Storage.slice';
import * as auth from "../../firebase/auth";
import {Database} from '../../firebase/Database';

const usersRef = firebase.database().ref('/users');

const CurrentDownloads = () => {

    const [currentDownloads, setCurrentDownloads] = useState<any|null>(null);
    const [currentDownloadsLoading, setCurrentDownloadsLoading] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [downloadTaskIdToRemove, setDownloadTaskIdToRemove] = useState<any|null>(null);

    const storageSelected = useSelector(getStorageSelected);

    const dispatch = useDispatch();

    useEffect(() => {
        (async function() {
            // dispatch(updateStorage(await Database.getSelectedStorage()))
            dispatch(fetchStorage());
        }())
    }, []);

    /**
     * Resume a particular download
     * @param download
     * @returns {Promise<void>}
     */
    const resumeDownload = async (download: any) => {

        try {
            switch (storageSelected) {
                case StorageEnum.GOOGLE_DRIVE:
                    await usersRef.child(await auth.getUid()).child('/settings/downloads/' + download.id).update({
                        event: 'resume'
                    });
                    dispatch(displaySuccessNotification('Resumed'));
                    break;

                case StorageEnum.NAS:
                    setCurrentDownloadsLoading(true);
                    setCurrentDownloads(null);

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
                    dispatch(displaySuccessNotification('Resumed'));
                    await loadCurrentDownloads();
                    break;

                default :
                    dispatch(displayErrorNotification('No Storage selected in Configuration'));
                    setCurrentDownloads([]);
                    setCurrentDownloadsLoading(false);
                    break;
            }
        } catch(error) {
            dispatch(displayErrorNotification('Error resuming this download'));
        }
    };

    /**
     * Pause a particular download
     * @param download
     * @returns {Promise<void>}
     */
    const pauseDownload = async (download: any) => {
        try {
            switch (storageSelected) {
                case StorageEnum.GOOGLE_DRIVE:

                    await usersRef.child(await auth.getUid()).child('/settings/downloads/' + download.id).update({
                        event: 'pause'
                    });
                    dispatch(displaySuccessNotification('Paused'));
                    break;

                case StorageEnum.NAS:
                    setCurrentDownloadsLoading(true);
                    setCurrentDownloads(null);

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
                    dispatch(displaySuccessNotification('Paused'));
                    await loadCurrentDownloads();
                    break;

                default :
                    dispatch(displayErrorNotification('No Storage selected in Configuration'));
                    setCurrentDownloads([]);
                    setCurrentDownloadsLoading(false);
                    break;
            }
        } catch(error) {
            dispatch(displayErrorNotification('Error pausing this download'));
        }

    };

    /**
     * Remove a particular download
     * @returns {Promise<void>}
     */
    const removeDownload = async () => {
        closeRemoveDialog();
        const download = downloadTaskIdToRemove;

        try {
            switch (storageSelected) {
                case StorageEnum.GOOGLE_DRIVE:
                    if (download.status === 'error') {
                        await usersRef.child(await auth.getUid()).child('/settings/downloads/' + download.id).remove();
                    } else if (download.status === 'finished') {
                        await usersRef.child(await auth.getUid()).child('/settings/downloads/' + download.id).remove();
                    } else {
                        await usersRef.child(await auth.getUid()).child('/settings/downloads/' + download.id).update({
                            event: 'destroy'
                        });
                    }
                    dispatch(displaySuccessNotification('Removed'));
                    break;

                case StorageEnum.NAS:
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

                    dispatch(displaySuccessNotification('Removed'));
                    await loadCurrentDownloads();
                    break;

                default :
                    dispatch(displayErrorNotification('No Storage selected in Configuration'));
                    setCurrentDownloads([]);
                    setCurrentDownloadsLoading(false);
                    break;
            }
        } catch(error) {
            dispatch(displayErrorNotification('Error removing this download'));
        }
    };

    /**
     * Clears every done downloads
     * @returns {Promise<void>}
     */
    const handleClearDownloads = async () => {

        try {
            switch (storageSelected) {
                case StorageEnum.GOOGLE_DRIVE:
                    const finishedDownloads = await usersRef.child(await auth.getUid()).child('/settings/downloads').orderByChild("status").equalTo('finished').once('value');

                    for (let finishedDownload in finishedDownloads.val()) {
                        usersRef.child(await auth.getUid()).child('/settings/downloads').child(finishedDownload).remove();
                    }

                    const errorDownloads = await usersRef.child(await auth.getUid()).child('/settings/downloads').orderByChild("status").equalTo('error').once('value');

                    for (let errorDownload in errorDownloads.val()) {
                        usersRef.child(await auth.getUid()).child('/settings/downloads').child(errorDownload).remove();
                    }

                    dispatch(displaySuccessNotification('Downloads cleared'));
                    break;

                case StorageEnum.NAS:
                    const downloadsToRemove = currentDownloads.tasks.filter((dl: any) => dl.status === "finished").map((dl: any) => dl.id).join(',');

                    if (downloadsToRemove.length > 0) {
                        setCurrentDownloads(null);
                        setCurrentDownloadsLoading(true);

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

                            dispatch(displaySuccessNotification('Removed'));

                        } catch(error) {
                            dispatch(displayErrorNotification('Error cleaning done downloads'));
                        }
                        await loadCurrentDownloads();
                    }
                    break;

                default:
                    dispatch(displayErrorNotification('No Storage selected in Configuration'));
                    setCurrentDownloads([]);
                    setCurrentDownloadsLoading(false);
                    break;
            }
        } catch(error) {
            dispatch(displayErrorNotification('Unknown error'));
        }
    };

    /**
     * Load all current downloads for the downloader selected
     */
    const loadCurrentDownloads = async () => {
        setCurrentDownloadsLoading(true);
        setCurrentDownloads(null);

        try {
            switch (storageSelected) {

                case StorageEnum.GOOGLE_DRIVE:
                    firebase.database().ref('/users').child(await auth.getUid()).child('/settings/downloads').on('value', (snapshot: any) => {

                        const downloads: [] = [];

                        snapshot.forEach((download: any) => {
                            // @ts-ignore
                            downloads.push(download.val());
                        });

                        setCurrentDownloads(downloads);
                    });

                    setCurrentDownloadsLoading(false);
                    break;

                case StorageEnum.NAS :
                    let response = await fetch('/api/current_downloads', {
                        method: 'GET',
                        headers: {
                            'token': await auth.getIdToken()
                        }
                    });
                    const downloadsStates = await response.json();

                    if (downloadsStates.message) {
                        dispatch(displayErrorNotification('Error loading current downloads'));
                        setCurrentDownloads(null);
                        setCurrentDownloadsLoading(false);
                    } else {
                        setCurrentDownloads(downloadsStates.currentDownloads);
                        setCurrentDownloadsLoading(false);
                    }
                    break;

                default:
                    dispatch(displayErrorNotification('No Storage selected in Configuration'));
                    setCurrentDownloads([]);
                    setCurrentDownloadsLoading(false);
                    break;
            }

        } catch(error) {
            setCurrentDownloadsLoading(false);
            setCurrentDownloads(null);
            dispatch(displayErrorNotification('Error while loading downloads'));
        }
    };

    const closeRemoveDialog = () => {
        setShowRemoveDialog(false);
        setDownloadTaskIdToRemove(null)
    };

    const handleShowRemoveDialog = async (taskId: any) => {
        setShowRemoveDialog(true);
        setDownloadTaskIdToRemove(taskId);
    };

    return (
      <Accordion onChange={(event, expanded) => expanded ? loadCurrentDownloads() : null}>

          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Storage : { storageSelected }</Typography>
          </AccordionSummary>

          <Dialog
            open={showRemoveDialog}
            onClose={closeRemoveDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">

              <DialogTitle id="alert-dialog-title">Remove item</DialogTitle>

              <DialogContent>
                  <DialogContentText id="alert-dialog-description">Do you really want to remove this download task ?</DialogContentText>
              </DialogContent>

              <DialogActions>
                  <Button onClick={closeRemoveDialog} color="primary">
                      Cancel
                  </Button>
                  <Button onClick={removeDownload} color="primary" autoFocus>
                      Remove
                  </Button>
              </DialogActions>
          </Dialog>
          <AccordionDetails style={{textAlign: 'center'}}>

              <List component="nav" style={{width: '100%'}}>

                  <CircularProgress style={currentDownloadsLoading ? {display: 'inline-block'} : {display: 'none'}} />

                  {currentDownloads !== null ? currentDownloads.length > 0 ? currentDownloads.map((currentDownload: any, index: number) => {
                        return (
                          <div key={index}>
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
                                          <IconButton
                                            style={{padding: '5px'}}
                                            disabled={currentDownload.status !== 'paused'}
                                            onClick={() => resumeDownload(currentDownload)}
                                          >
                                              <PlayCircle/>
                                          </IconButton>

                                          <IconButton
                                            style={{padding: '5px'}}
                                            disabled={currentDownload.status !== 'finishing' && currentDownload.status !== 'extracting' && currentDownload.status !== 'downloading'}
                                            onClick={() => pauseDownload(currentDownload)}
                                          >
                                              <PauseCircle/>
                                          </IconButton>

                                          <IconButton
                                            style={{padding: '5px'}}
                                            onClick={() => handleShowRemoveDialog(currentDownload)}
                                          >
                                              <RemoveCircle />
                                          </IconButton>
                                      </div>
                                  </div>

                              </div>

                              <LinearProgress variant="determinate" value={Math.round(currentDownload.size_downloaded*100 / currentDownload.size)} />

                          </div>
                        )
                    })
                    :

                    <div style={{padding: '10px', fontSize: '0.9rem', color: 'grey'}}>no current download</div>

                    :

                    null}

              </List>

          </AccordionDetails>

          {currentDownloads !== null ? currentDownloads.length > 0 ?

            <AccordionActions>
                <Button size="small"><Clear onClick={handleClearDownloads}/></Button>
            </AccordionActions>

            :

            null

            :

            null
          }
      </Accordion>
    )
}

export default CurrentDownloads

const DoneGreen = () => ( <Done style={{color: '#4CAF50'}}/> )

const ErrorRed = () => ( <Error style={{color: '#ff0000'}}/> );
