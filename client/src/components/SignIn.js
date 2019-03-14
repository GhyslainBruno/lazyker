import React, { Component } from 'react';
import {Link, withRouter} from 'react-router-dom';
import Divider from '@material-ui/core/Divider';
import { SignUpLink } from './SignUp';
import { auth } from '../firebase';
import * as routes from '../constants/routes';

// Trying the new material spec
import Button from '@material/react-button/dist';
import {HelperText, Input} from '@material/react-text-field';
import Paper from '@material-ui/core/Paper';
import CircularProgress from "@material-ui/core/CircularProgress";
import {GoogleProvider, Providers} from "./SignInProviders";
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

const SignInPage = ({ history }) =>
    <div>
        {/*<h1>SignIn</h1>*/}
        <SignInForm history={history} />
        {/*<SignUpLink />*/}
    </div>;

const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value,
});

const INITIAL_STATE = {
    email: '',
    password: '',
    showPassword: false,
    signInLoading: false,
    error: null,
};

class SignInForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...INITIAL_STATE
        };
    }

    onSubmit = (event) => {

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
                this.setState(byPropKey('error', error));
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
                            onChange={event => this.setState(byPropKey('email', event.target.value))}
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
                            onChange={event => this.setState(byPropKey('password', event.target.value))}
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
                            outlined={false}
                            unelevated={true}
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