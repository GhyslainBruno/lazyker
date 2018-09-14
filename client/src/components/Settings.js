import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormGroup from '@material-ui/core/FormGroup';
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
import { auth } from '../firebase';


class Settings extends Component {

    constructor (props) {
        super(props);

        this.state = {
            autoUpdate: null,
            output: null,
            h265: false,
            snack: false,
            snackBarMessage: null,
            loading: false,
            moviesPath: '',
            tvShowsPath: '',
            host: '',
            port: '',
            nasUsername: '',
            nasPassword: '',
            realdebridUsername: '',
            realdebridPassword: '',
            yggUsername: '',
            yggPassword: '',
            protocol: 'http',
            every: '',
            settingsLoading: false
        };

        props.changeNavigation('settings');
    }

    // startAutoUpdate = async () => {
    //     let response = await fetch('/api/autoupdate?start=true');
    //     response = await response.json();
    //     this.loadAutoUpdateState();
    // };
    //
    // stopAutoUpdate = async () => {
    //     let response = await fetch('/api/autoupdate?stop=true');
    //     response = await response.json();
    //     this.loadAutoUpdateState();
    // };

    // loadAutoUpdateState = async () => {
    //
    //     try {
    //         let response = await fetch('/api/autoupdate_state');
    //         response = await response.json();
    //         this.setState({ autoUpdate: response })
    //     } catch(error) {
    //         this.setState({snack: true, snackBarMessage: 'Error loading auto update state', settingsLoading: false})
    //     }
    //
    // };

    // componentWillMount() {
    //     this.loadAutoUpdateState();
    // }

    loadOutput = async () => {
        this.setState({output: null, loading: true});
        let response = await fetch('/api/autoupdate_output');
        response = await response.json();
        this.setState({ output: response.output , loading: false})
    };

    clearLogs = async () => {
        let response = await fetch('/api/clear_logs', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'token': await auth.getIdToken()
            },
            body: JSON.stringify({
                logs: 'logs'
            })
        });

        response = await response.json();

        this.setState({snack: true, snackBarMessage: response.message});

        this.loadOutput();
    };

    loadSettings = async () => {

        this.setState({settingsLoading: true});

        try {
            // this.loadAutoUpdateState();

            let response = await fetch('/api/settings', {
                method: 'GET',
                headers: {
                    'token': await auth.getIdToken()
                },
            });
            response = await response.json();
            response = response.settings;

            this.setState({
                settingsLoading: false,
                firstQuality: response.qualities.first,
                secondQuality: response.qualities.second,
                thirdQuality: response.qualities.third,
                h265: response.qualities.h265,
                moviesPath: response.nas.moviesPath,
                tvShowsPath: response.nas.tvShowsPath,
                protocol: response.nas.protocol,
                host: response.nas.host,
                port: response.nas.port,
                nasUsername: response.nas.account,
                nasPassword: response.nas.password,
                realdebridUsername: response.realdebrid.credentials.username,
                realdebridPassword: response.realdebrid.credentials.password,
                yggUsername: response.ygg.username,
                yggPassword: response.ygg.password,
                every: response.autoupdateTime
            })
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
                    realdebrid: {
                        credentials: {
                            username: this.state.realdebridUsername,
                            password: this.state.realdebridPassword
                        }
                    },
                    ygg: {
                        username: this.state.yggUsername,
                        password: this.state.yggPassword
                    },
                    autoupdateTime: this.state.every
                })
            });

            response = await response.json();

            this.setState({snack: true, snackBarMessage: response.message, settingsLoading: false})
        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error settings settings', settingsLoading: false})
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

    render() {
        return (
            <div style={{width: '100%'}}>

                <Snackbar
                    open={this.state.snack}
                    onClose={() => this.setState({snack: false})}
                    autoHideDuration={2000}
                    message={this.state.snackBarMessage}
                />

                <h1>Settings</h1>

                <ExpansionPanel style={{textAlign: 'center'}} onChange={(event, expanded) => expanded ? this.loadSettings() : null}>

                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Configuration</Typography>
                    </ExpansionPanelSummary>

                    <CircularProgress style={this.state.settingsLoading ? {display: 'inline-block', margin: '5px'} : {display: 'none'}} />


                    {!this.state.settingsLoading ?
                        <div>

                            <ExpansionPanelDetails style={{textAlign: 'center'}}>

                                <Grid container spacing={0}>

                                    <Grid item xs={12} style={{padding: '6px', color: 'white'}}>
                                        Qualities wanted
                                    </Grid>

                                    <Grid item xs={4} style={{padding: '6px'}}>
                                        <FormControl style={{minWidth: '80px'}}>
                                            <Select
                                                value={this.state.firstQuality}
                                                onChange={this.handlerQualityChange}
                                                inputProps={{
                                                    name: 'firstQuality',
                                                    id: 'first-quality',
                                                }}>

                                                <MenuItem value="none">
                                                    <em>None</em>
                                                </MenuItem>
                                                <MenuItem value={'hdtv'}>HDTV</MenuItem>
                                                <MenuItem value={'720p'}>720p</MenuItem>
                                                <MenuItem value={'1080p'}>1080p</MenuItem>
                                            </Select>
                                            <FormHelperText>First quality wanted</FormHelperText>
                                        </FormControl>
                                    </Grid>


                                    <Grid item xs={4} style={{padding: '6px'}}>
                                        <FormControl style={{minWidth: '80px', margin: '0 auto'}}>
                                            <Select
                                                value={this.state.secondQuality}
                                                onChange={this.handlerQualityChange}
                                                inputProps={{
                                                    name: 'secondQuality',
                                                    id: 'second-quality',
                                                }}>

                                                <MenuItem value="none">
                                                    <em>None</em>
                                                </MenuItem>
                                                <MenuItem value={'hdtv'}>HDTV</MenuItem>
                                                <MenuItem value={'720p'}>720p</MenuItem>
                                                <MenuItem value={'1080p'}>1080p</MenuItem>
                                            </Select>
                                            <FormHelperText>Second quality wanted</FormHelperText>
                                        </FormControl>
                                    </Grid>


                                    <Grid item xs={4} style={{padding: '6px'}}>
                                        <FormControl style={{minWidth: '80px', margin: '0 auto'}}>
                                            <Select
                                                value={this.state.thirdQuality}
                                                onChange={this.handlerQualityChange}
                                                inputProps={{
                                                    name: 'thirdQuality',
                                                    id: 'third-quality',
                                                }}>

                                                <MenuItem value="none">
                                                    <em>None</em>
                                                </MenuItem>
                                                <MenuItem value={'hdtv'}>HDTV</MenuItem>
                                                <MenuItem value={'720p'}>720p</MenuItem>
                                                <MenuItem value={'1080p'}>1080p</MenuItem>
                                            </Select>
                                            <FormHelperText>Third quality wanted</FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={4} style={{padding: '6px'}}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={this.state.h265}
                                                    onChange={this.handleH265Change('h265')}
                                                    value="h265"
                                                />
                                            }
                                            label="H265"
                                            style={{margin: '0 auto'}}/>
                                    </Grid>
                                </Grid>
                            </ExpansionPanelDetails>

                            <Divider/>

                            <ExpansionPanelDetails>

                                <Grid container spacing={0}>

                                    <Grid item xs={12} style={{padding: '6px', textAlign: 'center', color: 'white'}}>
                                        NAS configuration
                                    </Grid>


                                    <Grid item xs={12} style={{padding: '6px'}}>
                                        <FormControl fullWidth>
                                            <TextField
                                                label="Path to Movies"
                                                id="movie-path"
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
                                                value={this.state.tvShowsPath}
                                                onChange={(event) => this.setState({tvShowsPath: event.target.value})}
                                            />
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={2} style={{padding: '6px', position: 'relative', marginRight: '1.6rem', marginTop: '1rem', textAlign: 'left'}}>
                                        <FormControl className="protocolInput" fullWidth style={{minWidth: '80px', margin: '0 auto', bottom: '6px'}}>
                                            <Select
                                                value={this.state.protocol}
                                                onChange={this.handleProtocolChange}
                                                inputProps={{
                                                    name: 'protocol',
                                                    id: 'protocol',
                                                }}>

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
                                                value={this.state.nasPassword}
                                                onChange={(event) => this.setState({nasPassword: event.target.value})}
                                            />
                                        </FormControl>

                                    </Grid>

                                </Grid>

                            </ExpansionPanelDetails>

                            <Divider/>

                            <ExpansionPanelDetails>
                                <Grid container spacing={0}>

                                    <Grid item xs={12} style={{padding: '6px', textAlign: 'center', color: 'white'}}>
                                        RealDebrid configuration
                                    </Grid>

                                    <Grid item xs={12} style={{padding: '6px'}}>
                                        <FormControl fullWidth>
                                            <TextField
                                                label="Username"
                                                id="realdebrid-username"
                                                value={this.state.realdebridUsername}
                                                onChange={(event) => this.setState({realdebridUsername: event.target.value})}
                                            />
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} style={{padding: '6px'}}>
                                        <FormControl fullWidth>
                                            <TextField
                                                label="Password"
                                                id="realdebrid-password"
                                                value={this.state.realdebridPassword}
                                                onChange={(event) => this.setState({realdebridPassword: event.target.value})}
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </ExpansionPanelDetails>

                            {/*<ExpansionPanelDetails>*/}
                                {/*<Grid container spacing={0}>*/}

                                    {/*<Grid item xs={12} style={{padding: '6px', textAlign: 'center', color: 'white'}}>*/}
                                        {/*Ygg configuration*/}
                                    {/*</Grid>*/}

                                    {/*<Grid item xs={12} style={{padding: '6px'}}>*/}
                                        {/*<FormControl fullWidth>*/}
                                            {/*<TextField*/}
                                                {/*label="Username"*/}
                                                {/*id="ygg-username"*/}
                                                {/*value={this.state.yggUsername}*/}
                                                {/*onChange={(event) => this.setState({yggUsername: event.target.value})}*/}
                                            {/*/>*/}
                                        {/*</FormControl>*/}
                                    {/*</Grid>*/}

                                    {/*<Grid item xs={12} style={{padding: '6px'}}>*/}
                                        {/*<FormControl fullWidth>*/}
                                            {/*<TextField*/}
                                                {/*label="Password"*/}
                                                {/*id="ygg-password"*/}
                                                {/*value={this.state.yggPassword}*/}
                                                {/*onChange={(event) => this.setState({yggPassword: event.target.value})}*/}
                                            {/*/>*/}
                                        {/*</FormControl>*/}
                                    {/*</Grid>*/}
                                {/*</Grid>*/}
                            {/*</ExpansionPanelDetails>*/}

                            {/*<Divider/>*/}

                            {/*<ExpansionPanelDetails style={{display: 'inline'}}>*/}

                                {/*<div style={{padding: '6px', textAlign: 'center', color: 'white', marginTop: '20px', marginBottom: '20px'}}>*/}
                                    {/*Auto Update Management*/}
                                {/*</div>*/}

                                {/*<div className="autoUpdateSentence" style={{display: 'flex', textAlign: 'center', width: '100%'}}>*/}

                                    {/*<div style={{flex: '2'}}>*/}
                                        {/*Launch update every*/}
                                    {/*</div>*/}

                                    {/*<div style={{flex: '1', width: '10%'}}>*/}
                                        {/*<TextField*/}
                                            {/*style={{maxWidth: '100%'}}*/}
                                            {/*id="every"*/}
                                            {/*value={this.state.every}*/}
                                            {/*onChange={(event) => this.setState({every: event.target.value})}*/}
                                            {/*type="number"*/}
                                        {/*/>*/}
                                    {/*</div>*/}

                                    {/*<div style={{flex: '1'}}>*/}
                                        {/*hours*/}
                                    {/*</div>*/}
                                {/*</div>*/}

                                {/*<div style={{margin: '0 auto', textAlign: 'center', marginTop: '30px'}}>*/}
                                    {/*<Button variant="outlined" disabled={this.state.autoUpdate} onClick={this.startAutoUpdate} style={{margin: '5px'}}>*/}
                                        {/*Start*/}
                                    {/*</Button>*/}

                                    {/*<Button variant="outlined" disabled={!this.state.autoUpdate} onClick={this.stopAutoUpdate} style={{margin: '5px'}}>*/}
                                        {/*Stop*/}
                                    {/*</Button>*/}
                                {/*</div>*/}
                            {/*</ExpansionPanelDetails>*/}

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

                <ExpansionPanel onChange={(event, expanded) => expanded ? this.loadOutput() : null}>

                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Output</Typography>
                    </ExpansionPanelSummary>

                    <ExpansionPanelDetails>
                        <div style={this.state.loading ? {display: 'inline-block', width: '100%', textAlign: 'center'} : {display: 'none'}}>
                            <CircularProgress />
                        </div>


                        <p style={{whiteSpace: 'pre', overflow: 'scroll', height: '200px', width: '100%'}}>
                            {this.state.output}
                        </p>
                    </ExpansionPanelDetails>

                    <Divider />

                    <ExpansionPanelActions>
                        <Button
                            size="small"
                            onClick={this.clearLogs}>

                            <ClearLogs />
                        </Button>
                    </ExpansionPanelActions>

                </ExpansionPanel>

                <SignOutButton />

            </div>
        )
    }

}

export default Settings