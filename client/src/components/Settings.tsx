import React, { Component } from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
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

type SettingsState = {
    autoUpdate: any;
    h265: any;
    loading: boolean;
    moviesPath: string;
    tvShowsPath: string;
    host: string;
    port: string;
    nasUsername: string;
    nasPassword: string;
    protocol: string;
    yggUsername: string;
    yggPassword: string;
    every: string;
    settingsLoading: boolean;
    showPassword: boolean;
    googleDriveConnectLoading: boolean;
    storage: string;
    gdriveToken: any;
    moviesGdriveFolderId: any;
    moviesGdriveFolderName: any;
    parentMoviesGdriveFolderId: any;
    tvShowsGdriveFolderId: any;
    tvShowsGdriveFolderName: any;
    parentTvShowsGdriveFolderId: any;
    movieUptoboxFolderId: any;
    tvShowsUptoboxFolderId: any;
    uptoboxToken: any;
    snack: boolean;
    snackBarMessage: string;
    firstQuality: any;
    secondQuality: any;
    thirdQuality: any;
    realdebrid: boolean;
    alldebrid: boolean;
    labelWidth: any;
}

class Settings extends Component<SettingsProps, SettingsState> {

    // Parent functions
    constructor (props: SettingsProps) {
        super(props);

        this.state = {
            labelWidth: null,
            firstQuality: null,
            realdebrid: false,
            alldebrid: false,
            secondQuality: null,
            thirdQuality: null,
            snack: false,
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
            parentTvShowsGdriveFolderId: null,
            movieUptoboxFolderId: null,
            tvShowsUptoboxFolderId: null,
            uptoboxToken: null,
            snackBarMessage: ''
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

                    const responseJSON: LinkRealdebridUserDto = await response.json();
                    this.setState({snack: true, snackBarMessage: responseJSON.message});
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

            const response = await fetch('/api/settings', {
                method: 'GET',
                headers: {
                    'token': await auth.getIdToken()
                },
            });
            const responseJSON: LoadSettingsDto = await response.json();
            const settings = responseJSON.settings;

            if (settings === null) {
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

                if (settings.gdrive !== undefined) {
                    if (settings.gdrive.moviesGdriveFolder !== undefined) {
                        this.setState({
                            moviesGdriveFolderId: settings.gdrive.moviesGdriveFolder.moviesGdriveFolderId,
                            moviesGdriveFolderName: settings.gdrive.moviesGdriveFolder.moviesGdriveFolderName,
                            parentMoviesGdriveFolderId: settings.gdrive.moviesGdriveFolder.parentMoviesGdriveFolderId,
                        })
                    } else {
                        this.setState({
                            moviesGdriveFolderId: null,
                            moviesGdriveFolderName: null,
                            parentMoviesGdriveFolderId: null,
                        })
                    }

                    if (settings.gdrive.tvShowsGdriveFolder !== undefined) {
                        this.setState({
                            tvShowsGdriveFolderId: settings.gdrive.tvShowsGdriveFolder.tvShowsGdriveFolderId,
                            tvShowsGdriveFolderName: settings.gdrive.tvShowsGdriveFolder.tvShowsGdriveFolderName,
                            parentTvShowsGdriveFolderId: settings.gdrive.tvShowsGdriveFolder.parentTvShowsGdriveFolderId,
                        })
                    } else {
                        this.setState({
                            tvShowsGdriveFolderId: null,
                            tvShowsGdriveFolderName: null,
                            parentTvShowsGdriveFolderId: null,
                        })
                    }

                    if (settings.gdrive.token !== undefined) {
                        this.setState({
                            gdriveToken: settings.gdrive.token
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

                if (settings.qualities !== undefined) {
                    this.setState({
                        firstQuality: settings.qualities.first,
                        secondQuality: settings.qualities.second,
                        thirdQuality: settings.qualities.third,
                        h265: settings.qualities.h265
                    })
                } else {
                    this.setState({
                        firstQuality: null,
                        secondQuality: null,
                        thirdQuality: null,
                        h265: null
                    })
                }

                if (settings.nas !== undefined) {
                    this.setState({
                        moviesPath: settings.nas.moviesPath,
                        tvShowsPath: settings.nas.tvShowsPath,
                        protocol: settings.nas.protocol,
                        host: settings.nas.host,
                        port: settings.nas.port,
                        nasUsername: settings.nas.account,
                        nasPassword: settings.nas.password
                    })
                } else {
                    this.setState({
                        moviesPath: '',
                        tvShowsPath: '',
                        protocol: '',
                        host: '',
                        port: '',
                        nasUsername: '',
                        nasPassword: ''
                    })
                }

                if (settings.hasOwnProperty('storage')) {
                    this.setState({
                        storage: settings.storage
                    });
                } else {
                    this.setState({
                        storage: ''
                    });
                }

                this.setState({
                    realdebrid: settings.hasOwnProperty('realdebrid'),
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

            const responseJSON: SetSettingsDto = await response.json();

            this.setState({snack: true, snackBarMessage: responseJSON.message, settingsLoading: false})
        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error settings settings', settingsLoading: false})
        }

    };

    // Qualities (child) functions
    handlerQualityChange = (event: any) => {
        // @ts-ignore
        this.setState({ [event.target.name]: event.target.value });
    };

    handleH265Change = (name: any) => (event: any) => {
        // @ts-ignore
        this.setState({ [name]: event.target.checked });
    };

    // Storage (child) functions
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

    // TODO: implement in a redux store
    uptoboxConnect = async () => {
        console.log('Uptobox connected');
    };

    // TODO: implement in a redux store
    uptoboxDisconnect = async () => {
        console.log('Uptobox connected');
    };

    handleClickShowPassword = () => {
        this.setState(state => ({ showPassword: !state.showPassword }));
    };

    handleProtocolChange = (event: any) => {
        // @ts-ignore
        this.setState({ [event.target.name]: event.target.value });
    };

    setStorage = (storage: string) => {
        this.setState({storage: storage});
    };

    deleteMovieFolder = () => {
        this.setState({
            moviesGdriveFolderId: null,
            moviesGdriveFolderName: null,
            parentMoviesGdriveFolderId: null,
        })
    };

    setMovieFolder = (folder: any) => {
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

    setShowsFolder = (folder: any) => {
        this.setState({
            tvShowsGdriveFolderId: folder.id,
            tvShowsGdriveFolderName: folder.name,
            parentTvShowsGdriveFolderId: folder.parentId
        });
    };

    setMoviesPath = (path: any) => {
        this.setState({moviesPath: path})
    };

    setShowsPath = (path: any) => {
        this.setState({tvShowsPath: path})
    };

    setHost = (host: any) => {
        this.setState({host: host})
    };

    setPort = (port: any) => {
        this.setState({port: port})
    };

    setNasUserName = (username: string) => {
        this.setState({nasUsername: username})
    };

    setNasPassword = (password: any) => {
        this.setState({nasPassword: password})
    };

    // Debriders (child) functions
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

            const responseDto: ReadldebridDisconnectDto = await response.json();

            this.loadSettings();

            this.setState({snack: true, snackBarMessage: responseDto.message})

        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error disconnecting realdebrid'})
        }
    };

    //TODO: implement
    alldebridDisconnect = async () => {
        console.log('Alldebrid disconnect');
    }

    // realdebridConnect = async () => {
    //     try {
    //
    //         let response = await fetch('https://api.real-debrid.com/oauth/v2/auth?client_id=GPA2MB33HLS3I&redirect_uri=https%3A%2F%2Flazyker.ghyslain.xyz/api/link_rd&response_type=code&state=foo', {
    //             method: 'GET',
    //             headers: {
    //                 'Accept': 'application/json',
    //                 'Content-Type': 'application/json'
    //             }
    //         });
    //
    //         response = await response.json();
    //
    //         this.setState({snack: true, snackBarMessage: response.message})
    //     } catch(error) {
    //         this.setState({snack: true, snackBarMessage: 'Error disconnecting realdebrid'})
    //     }
    // };

    // Logs (child) functions
    displaySnackMessage = (message: string) => {
        this.setState({snack: true, snackBarMessage: message});
    };

    render() {

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
                    <ExpansionPanel style={{textAlign: 'center'}}
                                    onChange={(event, expanded) => expanded ? this.loadSettings() : null}>

                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography>Configuration</Typography>
                        </ExpansionPanelSummary>

                        <CircularProgress style={this.state.settingsLoading ? {
                            display: 'inline-block',
                            margin: '5px'
                        } : {display: 'none'}}/>

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
                                    handleClickShowPassword={this.handleClickShowPassword}
                                />

                                <Divider/>

                                <Debriders
                                    realdebrid={this.state.realdebrid}
                                    alldebrid={this.state.alldebrid}
                                    realdebridDisconnect={this.realdebridDisconnect}
                                />

                                <Divider/>

                                <Save
                                    setSettings={this.setSettings}
                                />
                            </div>
                            :
                            null
                        }

                    </ExpansionPanel>

                    <Logs
                        displaySnackMessage={this.displaySnackMessage}
                    />
                </div>

                <SignOutButton/>

                <PrivacyPolicies/>

            </div>
        );
    }

}

export default Settings
