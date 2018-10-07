import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { auth } from '../firebase';

import * as routes from '../constants/routes';
import TextField, {Input} from "@material/react-text-field";
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
            });

        event.preventDefault();
    };

    render() {

        const {
            email,
            passwordOne,
            passwordTwo,
            error,
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
                            className="authField"
                            outlined={true}
                            label='Email'
                            style={{width: '100%'}}
                        >
                            <Input
                                value={email}
                                type="text"
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
                                value={passwordOne}
                                type="password"
                                onChange={event => this.setState(byPropKey('passwordOne', event.target.value))}/>
                        </TextField>
                    </div>

                    <div>
                        <TextField
                            className="authField"
                            outlined={true}
                            label='Confirm password'
                            style={{width: '100%'}}
                        >
                            <Input
                                value={passwordTwo}
                                type="password"
                                onChange={event => this.setState(byPropKey('passwordTwo', event.target.value))}/>
                        </TextField>
                    </div>

                    <div style={{width: '100%', display: 'inline-block', textAlign: 'center'}}>
                        <Button
                            className="signUpBtn"
                            outlined={false}
                            unelevated={true}
                            disabled={isInvalid}
                            type="submit">
                            Create
                        </Button>

                        <SignInLink />

                    </div>

                    { error && <p>{error.message}</p> }
                </form>
            </Paper>
        );
    }
}

const SignUpLink = () =>
    <p>
        Don't have an account?
        {' '}
        <Link style={{color: 'red'}} to={routes.SIGN_UP}>Sign Up</Link>
    </p>;

export default withRouter(SignUpPage);
export {
    SignUpForm,
    SignUpLink,
};