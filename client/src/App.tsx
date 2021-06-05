import MuiAlert from '@material-ui/lab/Alert';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {SeverityEnum} from './ducks/snack/Severity.enum';
import {closeSnackBar, displaySuccessNotification} from './ducks/snack/Snackbar.slice';
import { auth as authTest }from './firebase/firebase';
import './App.scss';
import Shows from './components/Shows';
import Navigation from './components/Navigation';
import Movies from './components/Movies';
import Downloads from './components/Downloads';
import Settings from './components/Settings';
import Privacy from './components/privacy/PrivacyPolicies';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
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

const Alert = (props: any) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const theme = createMuiTheme({
    palette: {
        type: 'dark', // Switching the dark mode on is a single property value change.
        primary: red,
        secondary: green,
    },
});

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

type Store = {
    snack: {
        opened: boolean;
        message: string;
        severity: SeverityEnum;
    }
}

const App = (props: AppProps, state: AppState) => {

    const snackBarOpenedState = useSelector((state: Store): boolean => {return state.snack.opened});
    const snackBarMessage = useSelector((state: Store): string => {return state.snack.message});
    const snackBarSeverity = useSelector((state: Store): string => {return state.snack.severity});

    const dispatch = useDispatch();

    const [navigation, setNavigation] = useState(null);
    const [authUser, setAuthUser] = useState<any>(null);
    const [userLoading, setUserLoading] = useState(true);
    const [showAccountLinkDialog, setShowAccountLinkDialog] = useState(false);
    const [linkDialogMessage, setLinkDialogMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [emailOfUserThatAlreadyExists, setEmailOfUserThatAlreadyExists] = useState(null);
    const [providerAlreadyUsed, setProviderAlreadyUsed] = useState(null);
    const [providerToLink, setProviderToLink] = useState(null);
    const [password, setPassword] = useState<any>(null);


    useEffect(() => {
        setUserLoading(true);

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
                        dispatch(displaySuccessNotification('Accounts Linked'));
                    })
                    .catch(function(error) {
                        sessionStorage.removeItem('isAccountToLink');
                        sessionStorage.removeItem('globalProvider');
                        sessionStorage.removeItem('providerToLink');
                        sessionStorage.removeItem('pendingCredentials');
                        dispatch(displaySuccessNotification('Accounts Linked'));
                    })
              }
          })
          .catch(async error => {

              if (error.code === 'auth/account-exists-with-different-credential') {
                  authTest.fetchSignInMethodsForEmail(error.email)
                    .then(accountsForThisEmail => {
                        customizeDialogAndPassCredentials(error.email, accountsForThisEmail[0], error.credential.providerId, error);
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
                      dispatch(displaySuccessNotification('Accounts Linked'));
                  })
                  .catch(function(error) {
                      sessionStorage.removeItem('isAccountToLink');
                      sessionStorage.removeItem('globalProvider');
                      sessionStorage.removeItem('providerToLink');
                      sessionStorage.removeItem('pendingCredentials');
                      dispatch(displaySuccessNotification('Error during accounts link'));
                  })
            }

            setUserLoading(false)

            if (authUser) {
                setAuthUser(authUser)
            } else {
                setAuthUser(null)
            }

        });
    }, []);

    const customizeDialogAndPassCredentials = (email: any, providerToLink: any, globalProvider: any, error: any) => {

        setEmailOfUserThatAlreadyExists(email);
        setProviderAlreadyUsed(globalProvider);
        setProviderToLink(providerToLink);
        setShowAccountLinkDialog(true);



        // Using sessionStorage (as preconized by firebase) instead of global variables to
        // deal with redirect auth instead of popup auth
        // (as preconized by firebase for mobile applications)
        sessionStorage.setItem('globalProvider', globalProvider);
        sessionStorage.setItem('providerToLink', providerToLink);

        // Using sessionStorage to pass pendingCredentials
        sessionStorage.setItem('pendingCredentials', JSON.stringify(error.credential));
    };

    const signInExistantUserWithGlobalProvider = async () => {

        sessionStorage.setItem('isAccountToLink', 'true');

        switch (sessionStorage.getItem('providerToLink')) {

            case 'google.com':
                await auth.signInWithGoogle();
                break;

            case 'password':
                await auth.doSignInWithEmailAndPassword(emailOfUserThatAlreadyExists, password);
                setShowAccountLinkDialog(false);
                break;

            case 'facebook.com':
                await auth.signInWithFacebook();
                break;

            default:
                break;

        }
    };

    const closeDialog = () => {
        setShowAccountLinkDialog(false)
    };

    const changeNavigation = (target: any) => {
        setNavigation(target)
    };

    return (
      <Router>
          <MuiThemeProvider theme={theme}>

              <Snackbar
                open={snackBarOpenedState}
                autoHideDuration={2000}
                onClose={() => dispatch(closeSnackBar({}))}
              >
                  <Alert severity={snackBarSeverity}>
                      {snackBarMessage}
                  </Alert>
              </Snackbar>

              <Dialog
                open={showAccountLinkDialog}
                onClose={closeDialog}
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
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            variant="outlined"
                            style={{width: '100%'}}
                            onChange={event => setPassword(event.target.value)}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                      <IconButton
                                        aria-label="Toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                      >
                                          {showPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                  </InputAdornment>
                                ),
                            }}
                          />
                      </DialogContentText>
                  </DialogContent>

                  <DialogActions>
                      <Button onClick={closeDialog} color="primary">
                          No
                      </Button>
                      <Button onClick={signInExistantUserWithGlobalProvider} color="primary" autoFocus>
                          Link
                      </Button>
                  </DialogActions>
              </Dialog>

              {

                  userLoading ?

                    <div className="mainApp mui-fixed">
                        {/*<div style={{width: '100%', marginTop: '50vh', textAlign: 'center'}}>*/}
                        <div style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                            <CircularProgress style={userLoading ? {display: 'inline-block'} : {display: 'none'}}/>
                        </div>
                    </div>

                    :

                    authUser ?
                      <div className="mainApp mui-fixed">
                          <Switch>
                              <Route path='/shows' render={() =><Shows changeNavigation={changeNavigation} />}/>
                              <Route path='/movies' render={(props: any) => <Movies changeNavigation={changeNavigation} {...props} />}/>
                              <Route path='/downloads' render={() => <Downloads changeNavigation={changeNavigation}/>}/>
                              <Route path='/settings' render={(props: any) => <Settings changeNavigation={changeNavigation} {...props} />}/>
                              <Route path='/privacy_policy' render={() => <Privacy/>}/>
                              <Route path='/' render={() => <Redirect to="/movies?genre=popular" />}/>
                              <Route path='/signin' render={() => <Redirect to="/movies?genre=popular" />}/>
                              <Route path='/link_rd' render={(props)=> <Settings changeNavigation={changeNavigation} {...props} />}/>
                          </Switch>
                          <Route path='/movies/:id' render={(props: any) => <Movies changeNavigation={changeNavigation} {...props} />}/>
                          <Route path='/' render={() => <Navigation navigation={navigation} authUser={authUser} />}/>
                      </div>
                      :
                      <div className="mainApp mui-fixed" style={{top: '50%'}}>
                          <Switch>
                              <Route path='/signup' render={(props) =><SignUpForm {...props}/>}/>
                              <Route path='/pw-forget' render={(props: any) =><PasswordReset {...props} />}/>
                              <Route path='/privacy_policy' render={() => <Privacy/>}/>
                              <Route path='/signin' render={(props: any) =><SignInForm {...props} />}/>
                              <Route render={() =><HomePage />}/>
                          </Switch>
                      </div>

              }


          </MuiThemeProvider>
      </Router>
    )
}

export default App;
