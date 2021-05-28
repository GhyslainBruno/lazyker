import Button from '@material-ui/core/Button';
import React, { Component } from 'react';
import {Link, withRouter} from 'react-router-dom';
import Divider from '@material-ui/core/Divider';
import { SignUpLink } from './SignUp';
import { auth } from '../firebase';
import * as routes from '../constants/routes';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

// Trying the new material spec
// import Button from '@material/react-button/dist';
import Paper from '@material-ui/core/Paper';
import { Providers} from "./SignInProviders";
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Slide from '@material-ui/core/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
    // @ts-ignore
    return <Slide direction="up" ref={ref} {...props} />;
});

const SignInPage = (history: any) =>
    <div>
        <SignInForm history={history} />
    </div>;

const byPropKey = (propertyName: any, value: any) => () => ({
    [propertyName]: value,
});

// TODO: why using this ? -> should be deleted with redux
const INITIAL_STATE = {
    email: '',
    password: '',
    showPassword: false,
    signInLoading: false,
    // @ts-ignore
    error: null,
};

type SignInFormProps = {
    history: any;
}

type SignInFormState = {
    email: string;
    password: string;
    presentationDialogOpen: boolean;
    showPassword: boolean;
    signInLoading: boolean;
    error: any;
}

class SignInForm extends Component<SignInFormProps, SignInFormState> {
    constructor(props: SignInFormProps) {
        super(props);

        this.state = {
            ...INITIAL_STATE,
            presentationDialogOpen: false
        };
    }

    handleClose = () => {
        this.setState({presentationDialogOpen: false});
    };

    onSubmit = (event: any) => {

        this.setState({signInLoading: true});

        const {
            email,
            password,
        } = this.state;

        const {
            history,
        } = this.props;

        auth.doSignInWithEmailAndPassword(email, password)
            .then(() => {
                this.setState({signInLoading: false});
                this.setState({ ...INITIAL_STATE });
                history.push(routes.MOVIES);
            })
            .catch(error => {
                this.setState({signInLoading: false});
                this.setState({error: error});
            });

        event.preventDefault();
    };

    render() {
        const {
            email,
            password,
            error,
        } = this.state;

        const isInvalid =
            password === '' ||
            email === '';

        return (

            <Paper elevation={1} className="signInCard">

                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    fullScreen
                    // TODO: understand how to user TransitionComponent with TS instead of ignoring the TS errors
                    // @ts-ignore
                    TransitionComponent={Transition}
                    open={this.state.presentationDialogOpen}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"What is Lazyker"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            It is a web application that helps you manage your library.
                            <br/>
                            You can download new medias in 2 supported storage : Google Drive or a Synoloy NAS.
                            <br/>
                            For a better understanding of the whole application, I invite you to read the <a href="/privacy_policy">privacy policies</a>.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Keep going
                        </Button>
                    </DialogActions>
                </Dialog>

                <div style={{color: 'white'}}>
                    Sign In into Lazyker
                </div>

                <form onSubmit={this.onSubmit}>

                    <div>
                        <TextField
                            className="authFieldEmail"
                            variant="outlined"
                            type="email"
                            autoComplete="email"
                            label='Email'
                            style={{width: '100%'}}
                            value={email}
                            onChange={event => this.setState({ email: event.target.value })}
                        >

                        </TextField>
                    </div>

                    <div>
                        <TextField
                            className="authFieldPassword"
                            label='Password'
                            type={this.state.showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            variant="outlined"
                            style={{width: '100%'}}
                            value={password}
                            onChange={event => this.setState({ password: event.target.value })}
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
                        >

                        </TextField>
                    </div>

                    <div style={{width: '100%', display: 'inline-block', textAlign: 'center'}}>
                        <Button
                            className="signInBtn"
                            variant='outlined'
                            // unelevated={true}
                            disabled={isInvalid || this.state.signInLoading}
                            type="submit">
                            {this.state.signInLoading ?
                                <b>Loading</b>
                                :
                                <b>Sign In</b>
                            }
                        </Button>

                        <SignUpLink />

                        <ResetPassword />

                    </div>

                    <Divider/>

                    <Providers/>

                    { error && <p style={{color: '#f98e8d'}}>{error.message}</p> }
                </form>
            </Paper>

        );
    }
}

const SignInLink = () =>
    <p>
        Already have an account ?
        {' '}
        <Link style={{color: '#f98e8d'}} to={routes.SIGN_IN}>Sign In</Link>
    </p>;

const ResetPassword = () =>
    <p>
        Forgot your password ?
        {' '}
        <Link style={{color: '#f98e8d'}} to={routes.PASSWORD_FORGET}>Reset password</Link>
    </p>;

export default withRouter(SignInPage);

export {
    SignInForm,
    SignInLink
};
