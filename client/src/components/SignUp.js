import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { auth } from '../firebase';

import * as routes from '../constants/routes';
import {Input} from "@material/react-text-field";
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Button from "@material/react-button";
import Paper from "@material-ui/core/Paper/Paper";
import { SignInLink } from './SignIn';

const SignUpPage = ({history}) =>
    <div>
        <h1>SignUp</h1>
        <SignUpForm history={history} />
    </div>

const INITIAL_STATE = {
    email: '',
    passwordOne: '',
    passwordTwo: '',
    error: null,
    showPassword: false,
    signUpLoading: false
};

const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value,
});

class SignUpForm extends Component {
    constructor(props) {
        super(props);

        this.state = { ...INITIAL_STATE };
    }

    onSubmit = (event) => {

        this.setState({signUpLoading: true});

        const {
            email,
            passwordOne,
        } = this.state;

        const {
            history,
        } = this.props;

        auth.doCreateUserWithEmailAndPassword(email, passwordOne)
            .then(authUser => {
                this.setState({ ...INITIAL_STATE });
                // Use this to redirect afterwards
                history.push(routes.MOVIES);
            })
            .catch(error => {
                this.setState(byPropKey('error', error));
                this.setState({ signUpLoading: false });
            });

        event.preventDefault();
    };

    render() {

        const {
            email,
            passwordOne,
            passwordTwo,
            error,
            signUpLoading
        } = this.state;

        const isInvalid =
            passwordOne !== passwordTwo ||
            passwordOne === '' ||
            email === '';

        return (


            <Paper elevation={1} className="signInCard">

                <div style={{color: 'white'}}>
                    Create a new account
                </div>

                <form onSubmit={this.onSubmit}>

                    <div>
                        <TextField
                            className="authFieldEmail"
                            variant="outlined"
                            label='Email'
                            style={{width: '100%'}}
                            value={email}
                            type="email"
                            autoComplete="email"
                            onChange={event => this.setState(byPropKey('email', event.target.value))}
                        >

                        </TextField>
                    </div>

                    <div>
                        <TextField
                            className="authFieldPassword"
                            variant="outlined"
                            label='Password'
                            type={this.state.showPassword ? 'text' : 'password'}
                            style={{width: '100%'}}
                            value={passwordOne}
                            onChange={event => this.setState(byPropKey('passwordOne', event.target.value))}
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

                    <div>
                        <TextField
                            className="authFieldConfirmPassword"
                            variant="outlined"
                            label='Confirm password'
                            type={this.state.showPassword ? 'text' : 'password'}
                            style={{width: '100%'}}
                            value={passwordTwo}
                            onChange={event => this.setState(byPropKey('passwordTwo', event.target.value))}
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
                            className="signUpBtn"
                            outlined={false}
                            unelevated={true}
                            disabled={isInvalid || signUpLoading}
                            type="submit">
                            {this.state.signUpLoading ?
                                <b>Loading</b>
                                :
                                <b>Sign Up</b>
                            }
                        </Button>

                        <SignInLink />

                    </div>

                    { error && <p style={{color: '#f98e8d'}}>{error.message}</p> }
                </form>
            </Paper>
        );
    }
}

const SignUpLink = () =>
    <p>
        Don't have an account ?
        {' '}
        <Link style={{color: '#f98e8d'}} to={routes.SIGN_UP}>Sign Up</Link>
    </p>;

export default withRouter(SignUpPage);
export {
    SignUpForm,
    SignUpLink,
};