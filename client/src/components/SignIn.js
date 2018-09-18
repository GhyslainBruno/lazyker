import React, { Component } from 'react';
import {Link, withRouter} from 'react-router-dom';

import { SignUpLink } from './SignUp';
import { auth } from '../firebase';
import * as routes from '../constants/routes';

// Trying the new material spec
import Button from '@material/react-button/dist';
import TextField, {HelperText, Input} from '@material/react-text-field';
import Paper from '@material-ui/core/Paper';

const SignInPage = ({ history }) =>
    <div>
        {/*<h1>SignIn</h1>*/}
        <SignInForm history={history} />
        {/*<SignUpLink />*/}
    </div>

const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value,
});

const INITIAL_STATE = {
    email: '',
    password: '',
    error: null,
};

class SignInForm extends Component {
    constructor(props) {
        super(props);

        this.state = { ...INITIAL_STATE };
    }

    onSubmit = (event) => {
        const {
            email,
            password,
        } = this.state;

        const {
            history,
        } = this.props;

        auth.doSignInWithEmailAndPassword(email, password)
            .then(() => {
                this.setState({ ...INITIAL_STATE });
                history.push(routes.MOVIES);
            })
            .catch(error => {
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
                            className="authField"
                            outlined={true}
                            label='Email'
                            style={{width: '100%'}}
                        >
                            <Input
                                value={email}
                                onChange={event => this.setState(byPropKey('email', event.target.value))}/>
                        </TextField>
                    </div>

                    <div>
                        <TextField
                            className="authField"
                            outlined={true}
                            label='Password'
                            style={{width: '100%'}}
                        >
                            <Input
                                value={password}
                                onChange={event => this.setState(byPropKey('password', event.target.value))}/>
                        </TextField>
                    </div>

                    <div style={{width: '100%', display: 'inline-block', textAlign: 'center'}}>
                        <Button
                            className="signInBtn"
                            outlined={false}
                            unelevated={true}
                            disabled={isInvalid}
                            type="submit">
                            Sign In
                        </Button>

                        <SignUpLink />

                    </div>


                    { error && <p>{error.message}</p> }
                </form>
            </Paper>


        );
    }
}

const SignInLink = () =>
    <p>
        Already have an account?
        {' '}
        <Link style={{color: 'red'}} to={routes.SIGN_IN}>Sign In</Link>
    </p>;

export default withRouter(SignInPage);

export {
    SignInForm,
    SignInLink
};