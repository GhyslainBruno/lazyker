import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import SignOutButton from "../firebase/SignOutBtn";
import { auth } from '../firebase';
import CheckCircle from "../../node_modules/@material-ui/icons/CheckCircle";
import CancelCircle from "../../node_modules/@material-ui/icons/CancelOutlined";
import queryString from "qs";
import * as routes from '../constants/routes';
import { Link as RouterLink } from 'react-router-dom';
import gapi from 'gapi-client';
import Logs from "./settings/logs";
import Qualities from "./settings/configuration/qualities";
import Storage from "./settings/configuration/storage";

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

    setStorage = storage => {
        this.setState({storage: storage});
    };

    deleteMovieFolder = () => {
        this.setState({
            moviesGdriveFolderId: null,
            moviesGdriveFolderName: null,
            parentMoviesGdriveFolderId: null,
        })
    };

    setMovieFolder = folder => {
        this.setState({
            moviesGdriveFolderId: folder.id,
            moviesGdriveFolderName: folder.name,
            parentMoviesGdriveFolderId: folder.parentId
        });
    };

    deleteShowsFolder = () => {
        this.setState({
            tvShowsGdriveFolderId: null,
            tvShowsGdriveFolderName: null,
            parentTvShowsGdriveFolderId: null
        })
    };

    setShowsFolder = folder => {
        this.setState({
            tvShowsGdriveFolderId: folder.id,
            tvShowsGdriveFolderName: folder.name,
            parentTvShowsGdriveFolderId: folder.parentId
        });
    };

    setMoviesPath = path => {
        this.setState({moviesPath: path})
    };

    setShowsPath = path => {
        this.setState({tvShowsPath: path})
    };

    setHost = host => {
        this.setState({host: host})
    };

    setPort = port => {
        this.setState({port: port})
    };

    setNasUserName = username => {
        this.setState({nasUsername: username})
    };

    setNasPassword = password => {
        this.setState({nasPassword: password})
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

                                <Storage
                                    storage={this.state.storage}
                                    setStorage={this.setStorage}
                                    googleDriveConnectLoading={this.state.googleDriveConnectLoading}
                                    settingsLoading={this.state.settingsLoading}
                                    moviesGdriveFolderName={this.state.moviesGdriveFolderName}
                                    deleteMovieFolder={this.deleteMovieFolder}
                                    setMovieFolder={this.setMovieFolder}
                                    tvShowsGdriveFolderName={this.state.tvShowsGdriveFolderName}
                                    deleteShowsFolder={this.deleteShowsFolder}
                                    setShowsFolder={this.setShowsFolder}
                                    gdriveToken={this.state.gdriveToken}
                                    googleDriveDisConnect={this.googleDriveDisConnect}
                                    googleDriveConnect={this.googleDriveConnect}
                                    moviesPath={this.state.moviesPath}
                                    setMoviesPath={this.setMoviesPath}
                                    tvShowsPath={this.state.tvShowsPath}
                                    setShowsPath={this.setShowsPath}
                                    protocol={this.state.protocol}
                                    handleProtocolChange={this.handleProtocolChange}
                                    host={this.state.host}
                                    setHost={this.setHost}
                                    port={this.state.port}
                                    setPort={this.setPort}
                                    nasUsername={this.state.nasUsername}
                                    setNasUserName={this.setNasUserName}
                                    showPassword={this.state.showPassword}
                                    nasPassword={this.state.nasPassword}
                                    setNasPassword={this.setNasPassword}
                                />

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
