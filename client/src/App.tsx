import {appsactivity_v1} from 'googleapis';
import React, { Component } from 'react';
import { auth as authTest }from './firebase/firebase';
import './App.css';
import Shows from './components/Shows';
import Navigation from './components/Navigation';
import Movies from './components/Movies';
import Downloads from './components/Downloads';
import Settings from './components/Settings';
import Privacy from './components/privacy/PrivacyPolicies';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';
import { SignUpForm } from "./components/SignUp";
import { SignInForm } from "./components/SignIn";
import  HomePage from "./components/HomePage";
import PasswordReset from "./components/authentication/PasswordReset";
import CircularProgress from "@material-ui/core/CircularProgress";
// @ts-ignore
import Redirect from "react-router-dom/es/Redirect";
import Snackbar from "@material-ui/core/Snackbar";
import Dialog from "@material-ui/core/Dialog";
import Slide from "@material-ui/core/Slide";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import { auth } from './firebase';
import firebase from 'firebase';
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

const theme = createMuiTheme({
    palette: {
        type: 'dark', // Switching the dark mode on is a single property value change.
        primary: red,
        secondary: green,
    },
});

function Transition(props: any) {
    return <Slide direction="up" {...props} />;
}

const LinkDialogText = (props: any) => {
    const red = '#e89488';
    const blue = '#8c96c7';
    const white = '#ffffff';

    const providerToLinkColor = props.providerToLink === 'google.com' ? red : props.providerToLink === 'password' ? white : blue;
    const providerExistingColor = props.providerExisting === 'google.com' ? red : props.providerExisting === 'password' ? white : blue;

    return (
        <div>
            <p>
                The user <b>{props.email}</b> already exists in our database and is connected with
                <span style={{color: providerToLinkColor}}> {props.providerToLink}</span>.

                <div>
                    <span style={props.providerToLink !== 'password' ? {display: 'unset'} : {display: 'none'}}>
                    Do you want to link your
                    <span style={{color: providerToLinkColor}}> {props.providerToLink} </span>
                    account your
                    <span style={{color: providerExistingColor}}> {props.providerExisting} </span>
                    account ?
                </span>

                    <span style={props.providerToLink === 'password' ? {display: 'unset'} : {display: 'none'}}>
                    Please enter your password previously used to sign into lazyker to link your
                    <span style={{color: providerToLinkColor}}> {props.providerToLink} </span>
                    account with your
                    <span style={{color: providerExistingColor}}> {props.providerExisting} </span>
                    account
                </span>
                </div>
            </p>
        </div>
    );
};

type AppProps = {

}

type AppState = {
    navigation: any;
    authUser: any;
    userLoading: boolean;
    showAccountLinkDialog: boolean;
    snackBarMessage: string;
    snack: boolean;
    linkDialogMessage: any;
    showPassword: boolean;
    emailOfUserThatAlreadyExists: any;
    providerAlreadyUsed: any;
    providerToLink: any;
    password: any;
}

export default class App extends Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);

        this.state = {
            navigation: null,
            authUser: null,
            userLoading: true,
            showAccountLinkDialog: false,
            snackBarMessage: '',
            snack: false,
            linkDialogMessage: null,
            showPassword: false,
            emailOfUserThatAlreadyExists: null,
            providerAlreadyUsed: null,
            providerToLink: null,
            password: null,
        }
    }

    componentDidMount() {
        this.setState({userLoading: true});

        // Using "that" to display snack bars inside promises
        const that = this;

        authTest.getRedirectResult()
            .then(result => {

                // Here we check if we want to link 2 accounts providers / if not -> nothing is done
                if (sessionStorage.getItem('isAccountToLink')) {

                    let credentials: any = {};
                    // let provider = {};

                    switch (sessionStorage.getItem('globalProvider')) {
                        case 'google.com':
                            credentials = firebase.auth.GoogleAuthProvider.credential(JSON.parse(sessionStorage.getItem('pendingCredentials') as string).accessToken);
                            // provider = new authTest.GoogleAuthProvider();
                            break;
                        case 'password':
                            // TODO: fix this
                            // @ts-ignore
                            credentials = firebase.auth.EmailAuthProvider.credential(JSON.parse(sessionStorage.getItem('pendingCredentials') as string).accessToken);
                            // provider = new authTest.GoogleAuthProvider();
                            break;
                        case 'facebook.com':
                            credentials = firebase.auth.FacebookAuthProvider.credential(JSON.parse(sessionStorage.getItem('pendingCredentials') as string).accessToken);
                            // provider = auth.facebookProvider();
                            break;
                        default:
                            break;
                    }

                    // result.user.linkWithRedirect(provider)
                    result.user?.linkWithCredential(credentials)
                        .then(function(test) {
                            sessionStorage.removeItem('isAccountToLink');
                            sessionStorage.removeItem('globalProvider');
                            sessionStorage.removeItem('providerToLink');
                            sessionStorage.removeItem('pendingCredentials');
                            that.setState({snack: true, snackBarMessage: 'Accounts Linked'});
                        })
                        .catch(function(error) {
                            sessionStorage.removeItem('isAccountToLink');
                            sessionStorage.removeItem('globalProvider');
                            sessionStorage.removeItem('providerToLink');
                            sessionStorage.removeItem('pendingCredentials');
                            that.setState({snack: true, snackBarMessage: 'Accounts Linked'});
                        })
                }
            })
            .catch(async error => {

                if (error.code === 'auth/account-exists-with-different-credential') {
                    authTest.fetchProvidersForEmail(error.email)
                        .then(accountsForThisEmail => {
                            this.customizeDialogAndPassCredentials(error.email, accountsForThisEmail[0], error.credential.providerId, error);
                        })
                        .catch(error => {
                            console.log(error.message);
                        })
                }

            });

        authTest.onAuthStateChanged(authUser => {

            if (sessionStorage.getItem('isAccountToLink')) {

                let credentials: any = {};
                // let provider = {};

                switch (sessionStorage.getItem('globalProvider')) {
                    case 'google.com':
                        credentials = firebase.auth.GoogleAuthProvider.credential(JSON.parse(sessionStorage.getItem('pendingCredentials') as string).accessToken);
                        // provider = new authTest.GoogleAuthProvider();
                        break;
                    case 'password':
                        // @ts-ignore
                        credentials = firebase.auth.EmailAuthProvider.credential(JSON.parse(sessionStorage.getItem('pendingCredentials') as string).accessToken);
                        // provider = new authTest.GoogleAuthProvider();
                        break;
                    case 'facebook.com':
                        credentials = firebase.auth.FacebookAuthProvider.credential(JSON.parse(sessionStorage.getItem('pendingCredentials') as string).accessToken);
                        // provider = auth.facebookProvider();
                        break;
                    default:
                        break;
                }

                // result.user.linkWithRedirect(provider)
                authUser?.linkWithCredential(credentials)
                    .then(function(test) {
                        sessionStorage.removeItem('isAccountToLink');
                        sessionStorage.removeItem('globalProvider');
                        sessionStorage.removeItem('providerToLink');
                        sessionStorage.removeItem('pendingCredentials');
                        that.setState({snack: true, snackBarMessage: 'Accounts Linked'});
                    })
                    .catch(function(error) {
                        sessionStorage.removeItem('isAccountToLink');
                        sessionStorage.removeItem('globalProvider');
                        sessionStorage.removeItem('providerToLink');
                        sessionStorage.removeItem('pendingCredentials');
                        that.setState({snack: true, snackBarMessage: 'Error during accounts ink'});
                    })
            }

            this.setState({userLoading: false});

            if (authUser) {
                this.setState({ authUser });
            } else {
                this.setState({ authUser: null });
            }

        });
    }

    customizeDialogAndPassCredentials = (email: any, providerToLink: any, globalProvider: any, error: any) => {

        this.setState({
            emailOfUserThatAlreadyExists: email,
            providerAlreadyUsed: globalProvider,
            providerToLink: providerToLink,
            showAccountLinkDialog: true
        });



        // Using sessionStorage (as preconized by firebase) instead of global variables to
        // deal with redirect auth instead of popup auth
        // (as preconized by firebase for mobile applications)
        sessionStorage.setItem('globalProvider', globalProvider);
        sessionStorage.setItem('providerToLink', providerToLink);

        // Using sessionStorage to pass pendingCredentials
        sessionStorage.setItem('pendingCredentials', JSON.stringify(error.credential));
    };

    signInExistantUserWithGlobalProvider = async () => {

        sessionStorage.setItem('isAccountToLink', 'true');

        switch (sessionStorage.getItem('providerToLink')) {

            case 'google.com':
                await auth.signInWithGoogle();
                break;

            case 'password':
                await auth.doSignInWithEmailAndPassword(this.state.emailOfUserThatAlreadyExists, this.state.password);
                this.setState({showAccountLinkDialog: false});
                break;

            case 'facebook.com':
                await auth.signInWithFacebook();
                break;

            default:
                break;

        }
    };

    closeDialog = () => {
        this.setState({showAccountLinkDialog: false});
    };

    changeNavigation = (target: any) => {
        this.setState({ navigation: target });
    };

    render() {

        const {
            emailOfUserThatAlreadyExists,
            providerToLink,
            providerAlreadyUsed
        } = this.state;

        return (

            <Router>
                <MuiThemeProvider theme={theme}>

                    <Snackbar
                        open={this.state.snack}
                        onClose={() => this.setState({snack: false})}
                        autoHideDuration={2000}
                        message={this.state.snackBarMessage}
                    />

                    <Dialog
                        open={this.state.showAccountLinkDialog}
                        onClose={this.closeDialog}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description">

                        <DialogTitle id="alert-dialog-title">User already exists</DialogTitle>

                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                <LinkDialogText email={emailOfUserThatAlreadyExists} providerToLink={providerToLink} providerExisting={providerAlreadyUsed} />
                            </DialogContentText>

                            <DialogContentText style={providerToLink === 'password' ? {display: 'unset'} : {display: 'none'}}>
                                <TextField
                                    className="authFieldPassword"
                                    label='Password'
                                    type={this.state.showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    variant="outlined"
                                    style={{width: '100%'}}
                                    onChange={event => this.setState({password: event.target.value})}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="Toggle password visibility"
                                                    onClick={() => this.setState(state => ({ showPassword: !state.showPassword }))}
                                                >
                                                    {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </DialogContentText>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={this.closeDialog} color="primary">
                                No
                            </Button>
                            <Button onClick={this.signInExistantUserWithGlobalProvider} color="primary" autoFocus>
                                Link
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {

                        this.state.userLoading ?

                            <div className="mainApp mui-fixed">
                                {/*<div style={{width: '100%', marginTop: '50vh', textAlign: 'center'}}>*/}
                                <div style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                                    <CircularProgress style={this.state.userLoading ? {display: 'inline-block'} : {display: 'none'}}/>
                                </div>
                            </div>

                            :

                            this.state.authUser ?
                                <div className="mainApp mui-fixed">
                                    <Route exact path='/shows' render={() =><Shows changeNavigation={this.changeNavigation} />}/>
                                    <Route exact path='/movies/:id' render={(props: any) => <Movies changeNavigation={this.changeNavigation} {...props} />}/>
                                    <Route exact path='/movies' render={(props: any) => <Movies changeNavigation={this.changeNavigation} {...props} />}/>
                                    <Route exact path='/downloads' render={() => <Downloads changeNavigation={this.changeNavigation}/>}/>
                                    <Route exact path='/settings' render={(props: any) => <Settings changeNavigation={this.changeNavigation} {...props} />}/>
                                    <Route exact path='/privacy_policy' render={() => <Privacy/>}/>
                                    {/*<Route exact path='/' render={()=> <Movies changeNavigation={this.changeNavigation} />}/>*/}
                                    <Route exact path='/' render={() => <Redirect to="/movies?genre=popular" />}/>
                                    <Route exact path='/signin' render={() => <Redirect to="/movies?genre=popular" />}/>
                                    <Route path='/api/link_rd' render={(props)=> <Settings changeNavigation={this.changeNavigation} {...props} />}/>
                                    <Route path='/' render={() => <Navigation navigation={this.state.navigation} authUser={this.state.authUser} />}/>
                                </div>
                                :
                                <div className="mainApp mui-fixed" style={{top: '50%'}}>
                                    <Route exact path='/signup' render={(props) =><SignUpForm {...props}/>}/>
                                    <Route exact path='/pw-forget' render={(props: any) =><PasswordReset {...props} />}/>
                                    <Route exact path='/privacy_policy' render={() => <Privacy/>}/>
                                    <Route path='/signin' render={(props: any) =><SignInForm {...props} />}/>
                                    {/*//@ts-ignore*/}
                                    <Route path={/^(?!.*(pw-forget|signup|signin|privacy_policy)).*$/} render={() =><HomePage />}/>
                                </div>

                    }


                </MuiThemeProvider>
            </Router>
        )
    }
}
