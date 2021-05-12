import React, {Component, useEffect, useState} from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import {useDispatch, useSelector} from 'react-redux';
import {isConnected} from '../feature/debriders/Alldebrid.slice';
import SignOutButton from "../firebase/SignOutBtn";
import { auth } from '../firebase';
import queryString from "qs";
import gapi from 'gapi-client';
import Logs from "./settings/logs";
import Qualities from "./settings/configuration/qualities";
import Storage from "./settings/configuration/storage";
import Debriders from "./settings/configuration/debriders";
import PrivacyPolicies from "./settings/privacy_policies";
import Save from "./settings/save";

let auth2: any = null;

type LinkRealdebridUserDto = {
    message: string;
}

type ReadldebridDisconnectDto = {
    message: string;
}

type LoadSettingsDto = {
    settings: {
        storage: any;
        gdrive: {
            moviesGdriveFolder: {
                moviesGdriveFolderId: any;
                moviesGdriveFolderName: any;
                parentMoviesGdriveFolderId: any;
            };
            tvShowsGdriveFolder: {
                tvShowsGdriveFolderId: any;
                tvShowsGdriveFolderName: any;
                parentTvShowsGdriveFolderId: any;
            };
            token: any;
        };
        qualities: {
            first: any;
            second: any;
            third: any;
            h265: any;
        };
        nas: {
            moviesPath: any;
            tvShowsPath: any;
            protocol: any;
            host: any;
            port: any;
            account: any;
            password: any;
        };
        debriders: {
            alldebrid: {
                apiKey: string;
            }
        }
    }
}

type SetSettingsDto = {
    message: string;
}

type SettingsProps = {
    changeNavigation: (location: any) => void;
    location: {
        pathname: any;
        search: any;
    };
    history: any;
}

const Settings = (props: SettingsProps) => {

    const dispatch = useDispatch()

    const [labelWidth, setLabelWidth] = useState(null);
    const [firstQuality, setFirstQuality] = useState(null);
    const [realdebrid, setRealdebrid] = useState(false);
    const [secondQuality, setSecondQuality] = useState(null);
    const [thirdQuality, setThirdQuality] = useState(null);
    const [snack, setSnack] = useState(false);
    const [h265, seth265] = useState(false);
    const [loading, setLoading] = useState(false);
    const [moviesPath, setMoviesPath] = useState('');
    const [tvShowsPath, setTvShowsPath] = useState('');
    const [host, setHost] = useState('');
    const [port, setPort] = useState('');
    const [nasUsername, setNasUsername] = useState('');
    const [nasPassword, setNasPassword] = useState('');
    const [protocol, setProtocol] = useState('http');
    const [every, setEvery] = useState('');
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [googleDriveConnectLoading, setGoogleDriveConnectLoading] = useState(false);
    const [storage, setStorage] = useState('');
    const [gdriveToken, setGdriveToken] = useState(null);
    const [moviesGdriveFolderId, setMoviesGdriveFolderId] = useState(null);
    const [moviesGdriveFolderName, setMoviesGdriveFolderName] = useState(null);
    const [parentMoviesGdriveFolderId, setParentMoviesGdriveFolderId] = useState(null);
    const [tvShowsGdriveFolderId, setTvShowsGdriveFolderId] = useState(null);
    const [tvShowsGdriveFolderName, setTvShowsGdriveFolderName] = useState(null);
    const [parentTvShowsGdriveFolderId, setParentTvShowsGdriveFolderId] = useState(null);
    const [snackBarMessage, setSnackBarMessage] = useState('');

    useEffect(() => {
        (async function mountingComponent() {
            props.changeNavigation('settings');

            gapi.load('auth2', function() {
                auth2 = gapi.auth2.init({
                    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
                    clientId: '348584284-25m9u9qbgmapjd3vtt5oaai7mir5t7vu.apps.googleusercontent.com',
                    scope: 'https://www.googleapis.com/auth/drive'
                });
            });

            if (props.location !== undefined) {
                if (props.location.pathname === '/api/link_rd') {
                    const params = queryString.parse(props.location.search.replace(/^\?/,''));

                    try {
                        let response = await fetch('/api/link?code=' + params.code, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'token': await auth.getIdToken()
                            }
                        });

                        const responseJSON: LinkRealdebridUserDto = await response.json();
                        setSnack(true);
                        setSnackBarMessage(responseJSON.message)
                    } catch(error) {
                        setSnack(true);
                        setSnackBarMessage('Error connecting to realdebrid')
                    }

                    props.history.push('/settings');
                }
            }
        })();
    }, []);

    const loadSettings = async () => {

        setSettingsLoading(true);

        try {

            const response = await fetch('/api/settings', {
                method: 'GET',
                headers: {
                    'token': await auth.getIdToken()
                },
            });
            const responseJSON: LoadSettingsDto = await response.json();
            const settings = responseJSON.settings;

            if (settings === null) {
                setSnack(true)
                setSnackBarMessage('Please configure lazyker')
                setSettingsLoading(false)
                setFirstQuality(null)
                setSecondQuality(null)
                setThirdQuality(null)
                setRealdebrid(false)
                seth265(false)
                setMoviesPath('')
                setTvShowsPath('')
                setHost('')
                setPort('')
                setNasUsername('')
                setNasPassword('')
                setProtocol('http')
                setStorage('')
                setGdriveToken(null)
                setMoviesGdriveFolderId(null)
                setMoviesGdriveFolderName(null)
                setParentMoviesGdriveFolderId(null)
                setTvShowsGdriveFolderId(null)
                setTvShowsGdriveFolderName(null)
                setParentTvShowsGdriveFolderId(null)

            } else {

                if (settings.gdrive !== undefined) {
                    if (settings.gdrive.moviesGdriveFolder !== undefined) {
                        setMoviesGdriveFolderId(settings.gdrive.moviesGdriveFolder.moviesGdriveFolderId)
                        setMoviesGdriveFolderName(settings.gdrive.moviesGdriveFolder.moviesGdriveFolderName)
                        setParentMoviesGdriveFolderId(settings.gdrive.moviesGdriveFolder.parentMoviesGdriveFolderId)
                    } else {
                        setMoviesGdriveFolderId(null)
                        setMoviesGdriveFolderName(null)
                        setParentMoviesGdriveFolderId(null)
                    }

                    if (settings.gdrive.tvShowsGdriveFolder !== undefined) {
                        setTvShowsGdriveFolderId(settings.gdrive.tvShowsGdriveFolder.tvShowsGdriveFolderId)
                        setTvShowsGdriveFolderName(settings.gdrive.tvShowsGdriveFolder.tvShowsGdriveFolderName)
                        setParentTvShowsGdriveFolderId(settings.gdrive.tvShowsGdriveFolder.parentTvShowsGdriveFolderId)
                    } else {
                        setTvShowsGdriveFolderId(null)
                        setTvShowsGdriveFolderName(null)
                        setParentTvShowsGdriveFolderId(null)
                    }

                    if (settings.gdrive.token !== undefined) {
                        setGdriveToken(settings.gdrive.token)
                    } else {
                        setGdriveToken(null)
                    }

                } else {
                    setGdriveToken(null)
                }

                if (settings.qualities !== undefined) {
                    setFirstQuality(settings.qualities.first)
                    setSecondQuality(settings.qualities.second)
                    setThirdQuality(settings.qualities.third)
                    seth265(settings.qualities.h265)
                } else {
                    setFirstQuality(null)
                    setSecondQuality(null)
                    setThirdQuality(null)
                    seth265(false)
                }

                if (settings.nas !== undefined) {
                    setMoviesPath(settings.nas.moviesPath)
                    setTvShowsPath(settings.nas.tvShowsPath)
                    setProtocol(settings.nas.protocol)
                    setHost(settings.nas.host)
                    setPort(settings.nas.port)
                    setNasUsername(settings.nas.account)
                    setNasPassword(settings.nas.password)
                } else {
                    setMoviesPath('')
                    setTvShowsPath('')
                    setProtocol('')
                    setHost('')
                    setPort('')
                    setNasUsername('')
                    setNasPassword('')
                }

                if (settings.hasOwnProperty('storage')) {
                    setStorage(settings.storage)
                } else {
                    setStorage('')
                }

                if (settings?.debriders?.alldebrid?.apiKey) {
                    dispatch(isConnected('connected'));
                } else {
                    dispatch(isConnected('disconnected'));
                }

                setRealdebrid(settings.hasOwnProperty('realdebrid'))
                setSettingsLoading(false)
            }
        } catch(error) {
            setSnack(true);
            setSnackBarMessage('Error loading settings');
            setSettingsLoading(false);
        }
    };

    const setSettings = async () => {
        setSettingsLoading(true);
        try {
            let response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    qualities: {
                        first: firstQuality,
                        second: secondQuality,
                        third: thirdQuality,
                        h265: h265
                    },
                    nas: {
                        moviesPath: moviesPath,
                        tvShowsPath: tvShowsPath,
                        protocol: protocol,
                        host: host,
                        port: port,
                        account: nasUsername,
                        password: nasPassword
                    },
                    autoupdateTime: every,
                    storage: storage,
                    gdrive: {
                        moviesGdriveFolder: {
                            moviesGdriveFolderId: moviesGdriveFolderId,
                            moviesGdriveFolderName: moviesGdriveFolderName,
                            parentMoviesGdriveFolderId: parentMoviesGdriveFolderId,
                        },
                        tvShowsGdriveFolder: {
                            tvShowsGdriveFolderId: tvShowsGdriveFolderId,
                            tvShowsGdriveFolderName: tvShowsGdriveFolderName,
                            parentTvShowsGdriveFolderId: parentTvShowsGdriveFolderId,
                        }
                    }
                })
            });

            const responseJSON: SetSettingsDto = await response.json();

            setSnack(true);
            setSnackBarMessage(responseJSON.message);
            setSettingsLoading(false);
        } catch(error) {
            setSnack(true);
            setSnackBarMessage('Error settings settings');
            setSettingsLoading(false);
        }

    };

    const handlerQualityChange = (event: any) => {
        // @ts-ignore
        this.setState({ [event.target.name]: event.target.value });
    };

    const handleH265Change = (name: any) => (event: any) => {
        // @ts-ignore
        this.setState({ [name]: event.target.checked });
    };

    const googleDriveConnect = async () => {

        const code = await auth2.grantOfflineAccess();

        try {
            let response = await fetch('/api/gdrive_auth', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    code: code
                })
            });

            await setSettings();

            response = await response.json();
            await loadSettings();
        } catch (error) {
            setSnack(true);
            setSnackBarMessage('Error connecting to Google Drive');
            setGoogleDriveConnectLoading(false);
        }

    };

    const googleDriveDisConnect = async () => {
        try {
            let response = await fetch('/api/gdrive_disconect', {
                method: 'GET',
                headers: {
                    'token': await auth.getIdToken()
                }
            });
            response = await response.json();
            loadSettings();
        } catch(error) {
            setSnack(true);
            setSnackBarMessage('Error while unauthorizing lazker from Google Drive');
            setSettingsLoading(false);
        }
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleProtocolChange = (event: any) => {
        // @ts-ignore
        this.setState({ [event.target.name]: event.target.value });
    };

    const deleteMovieFolder = () => {
        setMoviesGdriveFolderId(null)
        setMoviesGdriveFolderName(null)
        setParentMoviesGdriveFolderId(null)
    };

    const setMovieFolder = (folder: any) => {
        setMoviesGdriveFolderId(folder.id)
        setMoviesGdriveFolderName(folder.name)
        setParentMoviesGdriveFolderId(folder.parentId)
    };

    const deleteShowsFolder = () => {
        setTvShowsGdriveFolderId(null)
        setTvShowsGdriveFolderName(null)
        setParentTvShowsGdriveFolderId(null)
    };

    const setShowsFolder = (folder: any) => {
        setTvShowsGdriveFolderId(folder.id)
        setTvShowsGdriveFolderName(folder.name)
        setParentTvShowsGdriveFolderId(folder.parentI)
    };

    const realdebridDisconnect = async () => {
        try {
            let response = await fetch('/api/unlink', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                }
            });

            const responseDto: ReadldebridDisconnectDto = await response.json();

            await loadSettings();

            setSnack(true);
            setSnackBarMessage(responseDto.message)

        } catch(error) {
            setSnack(true);
            setSnackBarMessage('Error disconnecting realdebrid')
        }
    };

    const displaySnackMessage = (message: string) => {
        setSnack(true);
        setSnackBarMessage(message);
    };

    return (
      <div style={{width: '100%', marginBottom: '10vh'}}>

          <Snackbar
            open={snack}
            onClose={() => setSnack(false)}
            autoHideDuration={2000}
            message={snackBarMessage}
          />

          <h1>Settings</h1>

          <div>
              <ExpansionPanel style={{textAlign: 'center'}}
                              onChange={(event, expanded) => expanded ? loadSettings() : null}>

                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                      <Typography>Configuration</Typography>
                  </ExpansionPanelSummary>

                  <CircularProgress style={settingsLoading ? {
                      display: 'inline-block',
                      margin: '5px'
                  } : {display: 'none'}}/>

                  {!settingsLoading ?
                    <div>

                        <Qualities
                          firstQuality={firstQuality}
                          handlerQualityChange={handlerQualityChange}
                          labelWidth={labelWidth}
                          secondQuality={secondQuality}
                          thirdQuality={thirdQuality}
                          h265={h265}
                          handleH265Change={handleH265Change}
                        />

                        <Divider/>

                        <Storage
                          storage={storage}
                          setStorage={setStorage}
                          googleDriveConnectLoading={googleDriveConnectLoading}
                          settingsLoading={settingsLoading}
                          moviesGdriveFolderName={moviesGdriveFolderName}
                          deleteMovieFolder={deleteMovieFolder}
                          setMovieFolder={setMovieFolder}
                          tvShowsGdriveFolderName={tvShowsGdriveFolderName}
                          deleteShowsFolder={deleteShowsFolder}
                          setShowsFolder={setShowsFolder}
                          gdriveToken={gdriveToken}
                          googleDriveDisConnect={googleDriveDisConnect}
                          googleDriveConnect={googleDriveConnect}
                          moviesPath={moviesPath}
                          setMoviesPath={setMoviesPath}
                          tvShowsPath={tvShowsPath}
                          setShowsPath={setTvShowsPath}
                          protocol={protocol}
                          handleProtocolChange={handleProtocolChange}
                          host={host}
                          setHost={setHost}
                          port={port}
                          setPort={setPort}
                          nasUsername={nasUsername}
                          setNasUserName={setNasUsername}
                          showPassword={showPassword}
                          nasPassword={nasPassword}
                          setNasPassword={setNasPassword}
                          handleClickShowPassword={handleClickShowPassword}
                        />

                        <Divider/>

                        <Debriders
                          realdebrid={realdebrid}
                          realdebridDisconnect={realdebridDisconnect}
                        />

                        <Divider/>

                        <Save
                          setSettings={setSettings}
                        />
                    </div>
                    :
                    null
                  }

              </ExpansionPanel>

              <Logs
                displaySnackMessage={displaySnackMessage}
              />
          </div>

          <SignOutButton/>

          <PrivacyPolicies/>

      </div>
    );

}

export default Settings
