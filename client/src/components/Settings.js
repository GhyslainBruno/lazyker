import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import ClearLogs from '@material-ui/icons/ClearAll';
import Divider from '@material-ui/core/Divider';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import TextField from '@material-ui/core/TextField';
import SignOutButton from "../firebase/SignOutBtn";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { auth } from '../firebase';
import { database } from '../firebase/firebase';
import firebase from 'firebase';
import CheckCircle from "../../node_modules/@material-ui/icons/CheckCircle";
import Folder from "../../node_modules/@material-ui/icons/FolderOpen";
import Link from "../../node_modules/@material-ui/icons/Link";
import LinkOff from "../../node_modules/@material-ui/icons/LinkOff";
import CancelCircle from "../../node_modules/@material-ui/icons/CancelOutlined";
import queryString from "qs";
import OutlinedInput from "@material-ui/core/OutlinedInput/OutlinedInput";
import InputAdornment from "@material-ui/core/InputAdornment/InputAdornment";
import IconButton from "@material-ui/core/IconButton/IconButton";
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import * as routes from '../constants/routes';
import { Link as RouterLink } from 'react-router-dom';
import GooglePicker from 'react-google-picker';
import gapi from 'gapi-client';
import Chip from "@material-ui/core/Chip/Chip";
import Logs from "./settings/logs";
import Qualities from "./settings/configuration/qualities";

let auth2 = null;

class Settings extends Component {

    constructor (props) {
        super(props);

        this.state = {
            autoUpdate: null,
            h265: false,
            loading: false,
            moviesPath: '',
            tvShowsPath: '',
            host: '',
            port: '',
            nasUsername: '',
            nasPassword: '',
            yggUsername: '',
            yggPassword: '',
            protocol: 'http',
            every: '',
            settingsLoading: false,
            showPassword: false,
            googleDriveConnectLoading: false,
            storage: '',
            gdriveToken: null,
            moviesGdriveFolderId: null,
            moviesGdriveFolderName: null,
            parentMoviesGdriveFolderId: null,
            tvShowsGdriveFolderId: null,
            tvShowsGdriveFolderName: null,
            parentTvShowsGdriveFolderId: null
        };

        props.changeNavigation('settings');
    }

    async componentDidMount() {

        gapi.load('auth2', function() {
            auth2 = gapi.auth2.init({
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
                clientId: '348584284-25m9u9qbgmapjd3vtt5oaai7mir5t7vu.apps.googleusercontent.com',
                scope: 'https://www.googleapis.com/auth/drive'
            });
        });

        if (this.props.location !== undefined) {
            if (this.props.location.pathname === '/api/link_rd') {
                const params = queryString.parse(this.props.location.search.replace(/^\?/,''));

                try {
                    let response = await fetch('/api/link?code=' + params.code, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'token': await auth.getIdToken()
                        }
                    });

                    response = await response.json();
                    this.setState({snack: true, snackBarMessage: response.message});
                } catch(error) {
                    this.setState({snack: true, snackBarMessage: 'Error connecting to realdebrid'})
                }

                this.props.history.push('/settings');
            }
        }
    };

    loadSettings = async () => {

        this.setState({settingsLoading: true});

        try {

            let response = await fetch('/api/settings', {
                method: 'GET',
                headers: {
                    'token': await auth.getIdToken()
                },
            });
            response = await response.json();
            response = response.settings;

            if (response === null) {
                this.setState({
                    snack: true,
                    snackBarMessage: 'Please configure lazyker',
                    settingsLoading: false,
                    firstQuality: null,
                    secondQuality: null,
                    thirdQuality: null,
                    realdebrid: false,
                    h265: false,
                    moviesPath: '',
                    tvShowsPath: '',
                    host: '',
                    port: '',
                    nasUsername: '',
                    nasPassword: '',
                    protocol: 'http',
                    storage: '',
                    gdriveToken: null,
                    moviesGdriveFolderId: null,
                    moviesGdriveFolderName: null,
                    parentMoviesGdriveFolderId: null,
                    tvShowsGdriveFolderId: null,
                    tvShowsGdriveFolderName: null,
                    parentTvShowsGdriveFolderId: null
                })
            } else {

                if (response.gdrive !== undefined) {
                    if (response.gdrive.moviesGdriveFolder !== undefined) {
                        this.setState({
                            moviesGdriveFolderId: response.gdrive.moviesGdriveFolder.moviesGdriveFolderId,
                            moviesGdriveFolderName: response.gdrive.moviesGdriveFolder.moviesGdriveFolderName,
                            parentMoviesGdriveFolderId: response.gdrive.moviesGdriveFolder.parentMoviesGdriveFolderId,
                        })
                    } else {
                        this.setState({
                            moviesGdriveFolderId: null,
                            moviesGdriveFolderName: null,
                            parentMoviesGdriveFolderId: null,
                        })
                    }

                    if (response.gdrive.tvShowsGdriveFolder !== undefined) {
                        this.setState({
                            tvShowsGdriveFolderId: response.gdrive.tvShowsGdriveFolder.tvShowsGdriveFolderId,
                            tvShowsGdriveFolderName: response.gdrive.tvShowsGdriveFolder.tvShowsGdriveFolderName,
                            parentTvShowsGdriveFolderId: response.gdrive.tvShowsGdriveFolder.parentTvShowsGdriveFolderId,
                        })
                    } else {
                        this.setState({
                            tvShowsGdriveFolderId: null,
                            tvShowsGdriveFolderName: null,
                            parentTvShowsGdriveFolderId: null,
                        })
                    }

                    if (response.gdrive.token !== undefined) {
                        this.setState({
                            gdriveToken: response.gdrive.token
                        })
                    } else {
                        this.setState({
                            gdriveToken: null
                        })
                    }

                } else {
                    this.setState({
                        gdriveToken: null
                    })
                }

                if (response.qualities !== undefined) {
                    this.setState({
                        firstQuality: response.qualities.first,
                        secondQuality: response.qualities.second,
                        thirdQuality: response.qualities.third,
                        h265: response.qualities.h265
                    })
                } else {
                    this.setState({
                        firstQuality: null,
                        secondQuality: null,
                        thirdQuality: null,
                        h265: null
                    })
                }

                if (response.nas !== undefined) {
                    this.setState({
                        moviesPath: response.nas.moviesPath,
                        tvShowsPath: response.nas.tvShowsPath,
                        protocol: response.nas.protocol,
                        host: response.nas.host,
                        port: response.nas.port,
                        nasUsername: response.nas.account,
                        nasPassword: response.nas.password
                    })
                } else {
                    this.setState({
                        moviesPath: null,
                        tvShowsPath: null,
                        protocol: null,
                        host: null,
                        port: null,
                        nasUsername: null,
                        nasPassword: null
                    })
                }

                if (response.hasOwnProperty('storage')) {
                    this.setState({
                        storage: response.storage
                    });
                } else {
                    this.setState({
                        storage: null
                    });
                }

                this.setState({
                    realdebrid: response.hasOwnProperty('realdebrid'),
                    settingsLoading: false,
                });

            }

        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error loading settings', settingsLoading: false})
        }


    };

    setSettings = async () => {
        this.setState({settingsLoading: true});
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
                        first: this.state.firstQuality,
                        second: this.state.secondQuality,
                        third: this.state.thirdQuality,
                        h265: this.state.h265
                    },
                    nas: {
                        moviesPath: this.state.moviesPath,
                        tvShowsPath: this.state.tvShowsPath,
                        protocol: this.state.protocol,
                        host: this.state.host,
                        port: this.state.port,
                        account: this.state.nasUsername,
                        password: this.state.nasPassword
                    },
                    // ygg: {
                    //     username: this.state.yggUsername,
                    //     password: this.state.yggPassword
                    // },
                    autoupdateTime: this.state.every,
                    storage: this.state.storage,
                    gdrive: {
                        moviesGdriveFolder: {
                            moviesGdriveFolderId: this.state.moviesGdriveFolderId,
                            moviesGdriveFolderName: this.state.moviesGdriveFolderName,
                            parentMoviesGdriveFolderId: this.state.parentMoviesGdriveFolderId,
                        },
                        tvShowsGdriveFolder: {
                            tvShowsGdriveFolderId: this.state.tvShowsGdriveFolderId,
                            tvShowsGdriveFolderName: this.state.tvShowsGdriveFolderName,
                            parentTvShowsGdriveFolderId: this.state.parentTvShowsGdriveFolderId,
                        }
                    }
                })
            });

            response = await response.json();

            this.setState({snack: true, snackBarMessage: response.message, settingsLoading: false})
        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error settings settings', settingsLoading: false})
        }

    };

    realdebridDisconnect = async () => {
        try {
            let response = await fetch('/api/unlink', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                }
            });

            response = await response.json();

            this.loadSettings();

            this.setState({snack: true, snackBarMessage: response.message})

        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error disconnecting realdebrid'})
        }
    };

    googleDriveConnect = async () => {

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

            await this.setSettings();

            response = await response.json();
            this.loadSettings();
        } catch (error) {
            this.setState({snack: true, snackBarMessage: 'Error connecting to Google Drive', googleDriveConnectLoading: false});
        }

    };

    googleDriveDisConnect = async () => {
        try {
            let response = await fetch('/api/gdrive_disconect', {
                method: 'GET',
                headers: {
                    'token': await auth.getIdToken()
                }
            });
            response = await response.json();
            this.loadSettings();
        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error while unauthorizing lazker from Google Drive', settingsLoading: false})
        }
    };

    testGdriveList = async () => {

        try {
            let response = await fetch('/api/gdrive_list', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                }
            });

            response = await response.json();
        } catch (error) {
            this.setState({snack: true, snackBarMessage: 'Error listing files from Google Drive'});
        }

    };

    handleClickShowPassword = () => {
        this.setState(state => ({ showPassword: !state.showPassword }));
    };

    realdebridConnect = async () => {
        try {

            let response = await fetch('https://api.real-debrid.com/oauth/v2/auth?client_id=GPA2MB33HLS3I&redirect_uri=https%3A%2F%2Flazyker.ghyslain.xyz/api/link_rd&response_type=code&state=foo', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            response = await response.json();

            this.setState({snack: true, snackBarMessage: response.message})
        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error disconnecting realdebrid'})
        }
    };

    handlerQualityChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleProtocolChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleH265Change = name => event => {
        this.setState({ [name]: event.target.checked });
    };

    displaySnackMessage = message => {
        this.setState({snack: true, snackBarMessage: message});
    };

    render() {

        const redirectUri = 'https://api.real-debrid.com/oauth/v2/auth?client_id=GPA2MB33HLS3I&redirect_uri=https%3A%2F%2Flazyker.ghyslain.xyz/api/link_rd&response_type=code&state=foobar';

        return (
            <div style={{width: '100%', marginBottom: '10vh'}}>

                <Snackbar
                    open={this.state.snack}
                    onClose={() => this.setState({snack: false})}
                    autoHideDuration={2000}
                    message={this.state.snackBarMessage}
                />

                <h1>Settings</h1>

                <div>
                    <ExpansionPanel style={{textAlign: 'center'}} onChange={(event, expanded) => expanded ? this.loadSettings() : null}>

                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Configuration</Typography>
                        </ExpansionPanelSummary>

                        <CircularProgress style={this.state.settingsLoading ? {display: 'inline-block', margin: '5px'} : {display: 'none'}} />


                        {!this.state.settingsLoading ?
                            <div>

                                <Qualities
                                    firstQuality={this.state.firstQuality}
                                    handlerQualityChange={this.handlerQualityChange}
                                    labelWidth={this.state.labelWidth}
                                    secondQuality={this.state.secondQuality}
                                    thirdQuality={this.state.thirdQuality}
                                    h265={this.state.h265}
                                    handleH265Change={this.handleH265Change}
                                />

                                <Divider/>

                                {/* TODO use something more user friendly in production - why not tabs ?  */}

                                <ExpansionPanelDetails>
                                    <Grid container spacing={0}>
                                        <Grid item xs={12} style={{padding: '6px', textAlign: 'center', color: 'white'}}>
                                            Storage
                                        </Grid>

                                        <Grid item xs={12} style={{padding: '6px', textAlign: 'center', color: 'white'}}>
                                            <Chip
                                                label="Google Drive"
                                                variant={this.state.storage === "gdrive" ? "default" : "outlined"}
                                                style={{margin: '3px'}} clickable="true"
                                                onClick={() => {this.setState({storage: 'gdrive'})}}/>
                                            <Chip
                                                label="NAS Synology"
                                                variant={this.state.storage === "nas" ? "default" : "outlined"}
                                                style={{margin: '3px'}}
                                                // clickable="true"
                                                // onClick={() => {this.setState({storage: 'nas'})}}
                                            />
                                        </Grid>

                                        {this.state.storage === 'gdrive' ?
                                            <div style={{width: '100%'}}>
                                                { this.googleDriveConnectLoading ?
                                                    <CircularProgress style={this.state.settingsLoading ? {display: 'inline-block', margin: '5px'} : {display: 'none'}} />
                                                    :
                                                    <Grid item xs={12} style={{padding: '6px'}}>

                                                        <div style={{display: 'flex'}}>
                                                            <div style={{flex: '1', marginTop: '10px'}}>
                                                                Movies
                                                            </div>
                                                            <div style={{flex: '1', marginTop: '10px'}}>
                                                                {
                                                                    this.state.moviesGdriveFolderName !== null ?
                                                                        <Chip
                                                                            label={this.state.moviesGdriveFolderName}
                                                                            onDelete={() => this.setState({
                                                                                moviesGdriveFolderId: null,
                                                                                moviesGdriveFolderName: null,
                                                                                parentMoviesGdriveFolderId: null,
                                                                            })}
                                                                        />
                                                                        :
                                                                        <CancelCircle style={{fontSize: '20', color: '#f44336'}}/>
                                                                }
                                                            </div>
                                                            <div style={{flex: '1', marginTop: '10px'}}>
                                                                {/* To get more details about Google Picker : https://github.com/sdoomz/react-google-picker (in demo specifically) */}
                                                                {/* Google Picker API must be enabled in Google developer console */}
                                                                <GooglePicker clientId={'348584284-25m9u9qbgmapjd3vtt5oaai7mir5t7vu.apps.googleusercontent.com'}
                                                                              developerKey={'AIzaSyAeHFqSP_4RdLM-Oz87XU2hMxWEgvvdOX0'}
                                                                              scope={['https://www.googleapis.com/auth/drive']}
                                                                              onChange={data => console.log('on change:', data)}
                                                                              onAuthFailed={data => console.log('on auth failed:', data)}
                                                                              multiselect={false}
                                                                              navHidden={true}
                                                                              authImmediate={false}
                                                                              mimeTypes={['application/vnd.google-apps.folder']}
                                                                              viewId={'FOLDERS'}
                                                                              createPicker={ (google, oauthToken) => {
                                                                                  const googleViewId = google.picker.ViewId.FOLDERS;
                                                                                  const docsView = new google.picker.DocsView(googleViewId)
                                                                                      .setIncludeFolders(true)
                                                                                      .setMimeTypes('application/vnd.google-apps.folder')
                                                                                      .setSelectFolderEnabled(true);

                                                                                  const picker = new window.google.picker.PickerBuilder()
                                                                                      .addView(docsView)
                                                                                      .setSize(1051,650)
                                                                                      .setTitle('Select movie folder')
                                                                                      .setOAuthToken(oauthToken)
                                                                                      .setDeveloperKey('AIzaSyAeHFqSP_4RdLM-Oz87XU2hMxWEgvvdOX0')
                                                                                      .setCallback((data)=>{

                                                                                          if (data.action === 'picked') {
                                                                                              this.setState({
                                                                                                  moviesGdriveFolderId: data.docs[0].id,
                                                                                                  moviesGdriveFolderName: data.docs[0].name,
                                                                                                  parentMoviesGdriveFolderId: data.docs[0].parentId
                                                                                              });
                                                                                          }

                                                                                      });

                                                                                  picker.build().setVisible(true);
                                                                              }}
                                                                >

                                                                    <IconButton>
                                                                        <Folder/>
                                                                    </IconButton>

                                                                </GooglePicker>
                                                            </div>
                                                        </div>

                                                        <div style={{display: 'flex'}}>
                                                            <div style={{flex: '1', marginTop: '10px'}}>
                                                                Shows
                                                            </div>
                                                            <div style={{flex: '1', marginTop: '10px'}}>
                                                                {
                                                                    this.state.tvShowsGdriveFolderName !== null ?
                                                                        <Chip
                                                                            label={this.state.tvShowsGdriveFolderName}
                                                                            onDelete={() => this.setState({
                                                                                tvShowsGdriveFolderId: null,
                                                                                tvShowsGdriveFolderName: null,
                                                                                parentTvShowsGdriveFolderId: null
                                                                            })}
                                                                        />
                                                                        :
                                                                        <CancelCircle style={{fontSize: '20', color: '#f44336'}}/>
                                                                }
                                                            </div>
                                                            <div style={{flex: '1', marginTop: '10px'}}>
                                                                {/* To get more details about Google Picker : https://github.com/sdoomz/react-google-picker (in demo specifically) */}
                                                                {/* Google Picker API must be enabled in Google developer console */}
                                                                <GooglePicker clientId={'348584284-25m9u9qbgmapjd3vtt5oaai7mir5t7vu.apps.googleusercontent.com'}
                                                                              developerKey={'AIzaSyAeHFqSP_4RdLM-Oz87XU2hMxWEgvvdOX0'}
                                                                              scope={['https://www.googleapis.com/auth/drive']}
                                                                              onChange={data => console.log('on change:', data)}
                                                                              onAuthFailed={data => console.log('on auth failed:', data)}
                                                                              multiselect={false}
                                                                              navHidden={true}
                                                                              authImmediate={false}
                                                                              mimeTypes={['application/vnd.google-apps.folder']}
                                                                              viewId={'FOLDERS'}
                                                                              createPicker={ (google, oauthToken) => {
                                                                                  const googleViewId = google.picker.ViewId.FOLDERS;
                                                                                  const docsView = new google.picker.DocsView(googleViewId)
                                                                                      .setIncludeFolders(true)
                                                                                      .setMimeTypes('application/vnd.google-apps.folder')
                                                                                      .setSelectFolderEnabled(true);

                                                                                  const picker = new window.google.picker.PickerBuilder()
                                                                                      .addView(docsView)
                                                                                      .setSize(1051,650)
                                                                                      .setTitle('Select Tv Shows folder')
                                                                                      .setOAuthToken(oauthToken)
                                                                                      .setDeveloperKey('AIzaSyAeHFqSP_4RdLM-Oz87XU2hMxWEgvvdOX0')
                                                                                      .setCallback((data)=>{

                                                                                          if (data.action === 'picked') {
                                                                                              this.setState({
                                                                                                  tvShowsGdriveFolderId: data.docs[0].id,
                                                                                                  tvShowsGdriveFolderName: data.docs[0].name,
                                                                                                  parentTvShowsGdriveFolderId: data.docs[0].parentId
                                                                                              })
                                                                                          }

                                                                                      });

                                                                                  picker.build().setVisible(true);
                                                                              }}
                                                                >

                                                                    <IconButton>
                                                                        <Folder/>
                                                                    </IconButton>

                                                                </GooglePicker>
                                                            </div>
                                                        </div>

                                                        <div style={{display: 'flex'}}>
                                                            <div style={{flex: '1'}}>
                                                                Link
                                                            </div>
                                                            <div style={{flex: '1'}}>
                                                                {
                                                                    this.state.gdriveToken !== null ?
                                                                        <CheckCircle style={{fontSize: '20', color: '#00f429'}}/>
                                                                        :
                                                                        <CancelCircle style={{fontSize: '20', color: '#f44336'}}/>
                                                                }
                                                            </div>
                                                            <div style={{flex: '1'}}>
                                                                {
                                                                    this.state.gdriveToken !== null ?
                                                                        <IconButton onClick={this.googleDriveDisConnect}>
                                                                            <LinkOff/>
                                                                        </IconButton>
                                                                        :
                                                                        <IconButton onClick={this.googleDriveConnect}>
                                                                            <Link/>
                                                                        </IconButton>
                                                                }
                                                            </div>
                                                        </div>

                                                    </Grid>
                                                }
                                            </div>
                                            :
                                            <div>
                                                <Grid container spacing={0}>

                                                    <Grid item xs={12} style={{padding: '6px'}}>
                                                        <FormControl fullWidth>
                                                            <TextField
                                                                label="Path to Movies"
                                                                id="movie-path"
                                                                variant="outlined"
                                                                value={this.state.moviesPath}
                                                                onChange={(event) => this.setState({moviesPath: event.target.value})}
                                                            />
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12} style={{padding: '6px'}}>
                                                        <FormControl fullWidth>
                                                            <TextField
                                                                label="Path to Tv Shows"
                                                                id="tv-shows-path"
                                                                variant="outlined"
                                                                value={this.state.tvShowsPath}
                                                                onChange={(event) => this.setState({tvShowsPath: event.target.value})}
                                                            />
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12} sm={2} style={{padding: '6px', position: 'relative', marginRight: '1.6rem', marginTop: '1rem', textAlign: 'left'}}>
                                                        <FormControl className="protocolInput" variant="outlined" fullWidth style={{minWidth: '80px', margin: '0 auto', bottom: '6px'}}>
                                                            <Select
                                                                value={this.state.protocol}
                                                                onChange={this.handleProtocolChange}
                                                                input={
                                                                    <OutlinedInput
                                                                        labelWidth={0}
                                                                        name="protocol"
                                                                        id="protocol"
                                                                    />
                                                                }>

                                                                <MenuItem value={'http'}>http</MenuItem>
                                                                <MenuItem value={'https'}>https</MenuItem>
                                                            </Select>
                                                            {/*<FormHelperText>Protocol</FormHelperText>*/}
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12} sm={7} style={{padding: '6px'}}>
                                                        <FormControl fullWidth>
                                                            <TextField
                                                                label="Host"
                                                                id="host"
                                                                variant="outlined"
                                                                value={this.state.host}
                                                                onChange={(event) => this.setState({host: event.target.value})}
                                                            />
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={4} sm={2} style={{padding: '6px'}}>
                                                        <FormControl fullWidth>
                                                            <TextField
                                                                label="Port"
                                                                id="port"
                                                                variant="outlined"
                                                                value={this.state.port}
                                                                onChange={(event) => this.setState({port: event.target.value})}
                                                            />
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12} style={{padding: '6px'}}>
                                                        <FormControl fullWidth>
                                                            <TextField
                                                                label="Username"
                                                                id="nas-username"
                                                                variant="outlined"
                                                                value={this.state.nasUsername}
                                                                onChange={(event) => this.setState({nasUsername: event.target.value})}
                                                            />
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12} style={{padding: '6px'}}>
                                                        <FormControl fullWidth>
                                                            <TextField
                                                                label="Password"
                                                                id="nas-password"
                                                                type={this.state.showPassword ? 'text' : 'password'}
                                                                variant="outlined"
                                                                value={this.state.nasPassword}
                                                                onChange={(event) => this.setState({nasPassword: event.target.value})}
                                                                InputProps={{
                                                                    endAdornment: (
                                                                        <InputAdornment position="end">
                                                                            <IconButton
                                                                                aria-label="Toggle password visibility"
                                                                                onClick={this.handleClickShowPassword}
                                                                            >
                                                                                {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                                                                            </IconButton>
                                                                        </InputAdornment>
                                                                    ),
                                                                }}
                                                            />
                                                        </FormControl>

                                                    </Grid>

                                                </Grid>
                                            </div>
                                        }

                                    </Grid>
                                </ExpansionPanelDetails>

                                <Divider/>

                                <ExpansionPanelDetails>
                                    <Grid container spacing={0}>

                                        <Grid item xs={12} style={{padding: '6px', textAlign: 'center', color: 'white'}}>
                                            Debriders
                                        </Grid>

                                        {
                                            this.state.realdebrid ?
                                                <Grid item xs={12} style={{padding: '6px'}}>

                                                    <div style={{display: 'flex'}}>
                                                        <div style={{flex: '1', marginTop: '10px'}}>
                                                            Realdebrid
                                                        </div>

                                                        <div style={{flex: '1', marginTop: '10px'}}>
                                                            <CheckCircle style={{fontSize: '20', color: '#00f429'}}/>
                                                        </div>

                                                        <div style={{flex: '1'}}>
                                                            <Button variant="outlined" onClick={this.realdebridDisconnect}>
                                                                Disconnect
                                                            </Button>
                                                        </div>
                                                    </div>

                                                </Grid>
                                                :
                                                <Grid item xs={12} style={{padding: '6px'}}>

                                                    <div style={{display: 'flex'}}>
                                                        <div style={{flex: '1', marginTop: '10px'}}>
                                                            Realdebrid
                                                        </div>

                                                        <div style={{flex: '1', marginTop: '10px'}}>
                                                            <CancelCircle style={{fontSize: '20', color: '#f44336'}}/>
                                                        </div>

                                                        <div style={{flex: '1'}}>
                                                            <Button variant="outlined" href={redirectUri}>
                                                                Connect
                                                            </Button>
                                                        </div>
                                                    </div>

                                                </Grid>
                                        }

                                    </Grid>
                                </ExpansionPanelDetails>

                                <Divider/>

                                <ExpansionPanelDetails style={{padding: '24px'}}>
                                    <Button variant="outlined" onClick={this.setSettings} style={{margin: 'auto 0 auto auto'}}>
                                        Save
                                    </Button>
                                </ExpansionPanelDetails>
                            </div>
                            :
                            null
                        }

                    </ExpansionPanel>

                    {/* Logs pannel */}
                    <Logs
                        displaySnackMessage={this.displaySnackMessage}
                    />
                </div>

                <SignOutButton />

                <div style={{textAlign: 'center', marginTop: '20px'}}>
                    <RouterLink style={{color: 'red'}} to={routes.PRIVACY}>Privacy policies</RouterLink>
                </div>

            </div>
        )
    }

}

export default Settings
