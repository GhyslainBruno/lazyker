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
import CheckCircle from "../../node_modules/@material-ui/icons/CheckCircle";
import CancelCircle from "../../node_modules/@material-ui/icons/CancelOutlined";
import queryString from "qs";
import OutlinedInput from "@material-ui/core/OutlinedInput/OutlinedInput";
import InputAdornment from "@material-ui/core/InputAdornment/InputAdornment";
import IconButton from "@material-ui/core/IconButton/IconButton";
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

class Settings extends Component {

    constructor (props) {
        super(props);

        this.state = {
            autoUpdate: null,
            output: [],
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
            yggUsername: '',
            yggPassword: '',
            protocol: 'http',
            every: '',
            settingsLoading: false,
            showPassword: false
        };

        props.changeNavigation('settings');
    }

    async componentDidMount() {
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

    loadOutput = async () => {
        this.setState({output: [], loading: true});
        let response = await fetch('/api/logs', {
            method: 'GET',
            headers: {
                'token': await auth.getIdToken()
            }
        });
        response = await response.json();
        this.setState({ output: response.map(el => {return {text: el.textPayload, time: el.timestamp.seconds * 1000}}) , loading: false})
    };

    clearLogs = async () => {
        try {
            let response = await fetch('/api/logs', {
                method: 'DELETE',
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
        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error clearing logs'})
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
                realdebrid: response.hasOwnProperty('realdebrid'),
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

    handleClickShowPassword = () => {
        this.setState(state => ({ showPassword: !state.showPassword }));
    };

    realdebridConnect = async () => {
        try {
            let response = await fetch('https://api.real-debrid.com/oauth/v2/auth?client_id=GPA2MB33HLS3I&redirect_uri=http%3A%2F%2Flazyker.ghyslain.xyz/api/link_rd&response_type=code&state=foo', {
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

    render() {

        const redirectUri = 'https://api.real-debrid.com/oauth/v2/auth?client_id=GPA2MB33HLS3I&redirect_uri=http%3A%2F%2Flazyker.ghyslain.xyz/api/link_rd&response_type=code&state=foobar';

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
                                        <FormControl style={{minWidth: '80px'}} variant="outlined">
                                            <Select
                                                value={this.state.firstQuality}
                                                onChange={this.handlerQualityChange}
                                                input={
                                                    <OutlinedInput
                                                    labelWidth={this.state.labelWidth}
                                                    name="firstQuality"
                                                    id="first-quality"
                                                    />
                                                }>

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
                                        <FormControl variant="outlined" style={{minWidth: '80px', margin: '0 auto'}}>
                                            <Select
                                                value={this.state.secondQuality}
                                                onChange={this.handlerQualityChange}
                                                input={
                                                    <OutlinedInput
                                                        labelWidth={this.state.labelWidth}
                                                        name="secondQuality"
                                                        id="second-quality"
                                                    />
                                                }>

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
                                        <FormControl style={{minWidth: '80px', margin: '0 auto'}} variant="outlined">
                                            <Select
                                                value={this.state.thirdQuality}
                                                onChange={this.handlerQualityChange}
                                                input={
                                                <OutlinedInput
                                                    labelWidth={this.state.labelWidth}
                                                    name="thirdQuality"
                                                    id="third-quality"
                                                />
                                            }>


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

                                    {/*<Grid item xs={12} style={{padding: '6px'}}>*/}
                                        {/*<FormControl fullWidth>*/}
                                            {/*<TextField*/}
                                                {/*label="Password"*/}
                                                {/*id="realdebrid-password"*/}
                                                {/*value={this.state.realdebridPassword}*/}
                                                {/*onChange={(event) => this.setState({realdebridPassword: event.target.value})}*/}
                                            {/*/>*/}
                                        {/*</FormControl>*/}
                                    {/*</Grid>*/}
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


                        <List dense={true}>

                            {this.state.output.map(log => {

                                // const date = new Date(log.time).toDateString();

                                return (
                                    <ListItem>
                                        <ListItemText
                                            primary={log.text}
                                            secondary={new Date(log.time).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute: 'numeric' })}
                                        />
                                    </ListItem>
                                )

                            })}

                        </List>

                        {/*<p style={{whiteSpace: 'pre', overflow: 'scroll', height: '200px', width: '100%'}}>*/}
                            {/*{this.state.output}*/}
                        {/*</p>*/}
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