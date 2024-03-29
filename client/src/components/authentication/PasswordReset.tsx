import React, { Component } from 'react';
import { auth } from '../../firebase';
import Button from "@material-ui/core/Button";
import Paper from '@material-ui/core/Paper';
import TextField from "@material-ui/core/TextField";
import {SignInLink} from "../SignIn";

type MyProps = {
    history: any
};
type MyState = {
    email: string,
    error: any,
    message: any,
    passwordResetLoading: boolean,
    isPasswordReset: boolean
};

class PasswordReset extends Component<MyProps, MyState> {
    constructor(props: any) {
        super(props);

        this.state = {
            error: null,
            message: null,
            email: '',
            passwordResetLoading: false,
            isPasswordReset: false
        };
    }

    onSubmit = (event: any) => {

        this.setState({passwordResetLoading: true});

        const {
            email,
        } = this.state;

        const {
            history,
        } = this.props;

        auth.doPasswordReset(email)
            .then(() => {
                this.setState({
                    isPasswordReset: true,
                    passwordResetLoading: false,
                    message: 'Email sent - follow instructions and signin again'
                });
            })
            .catch(error => {
                this.setState({passwordResetLoading: false});
                this.setState({ error: error });
            });

        event.preventDefault();
    };

    render() {
        const {
            email,
            error,
            message
        } = this.state;

        const isEmailInvalid = email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/) !== null;

        return (

            <Paper elevation={1} className="signInCard">

                <div style={{color: 'white'}}>
                    Send an email to reset your password
                </div>

                <form onSubmit={this.onSubmit}>

                    <div>
                        <TextField
                            className="authFieldPassword"
                            type="email"
                            autoComplete="email"
                            variant="outlined"
                            label='Email'
                            style={{width: '100%'}}
                            value={email}
                            onChange={event => this.setState({email: event.target.value})}
                        >

                        </TextField>
                    </div>

                    <div style={{width: '100%', display: 'inline-block', textAlign: 'center'}}>
                        <Button
                            className="signInBtn"
                            variant={'outlined'}
                            disabled={! isEmailInvalid || this.state.passwordResetLoading}
                            type="submit">
                            {this.state.passwordResetLoading ?
                                <b>Loading</b>
                                :
                                <b>Send email</b>
                            }
                        </Button>

                        <SignInLink />

                    </div>

                    { error && <p style={{color: '#f98e8d'}}>{error.message}</p> }

                    { <p style={{color: '#b9e1bc', textAlign: 'center', width: '100%'}}>{ message }</p>}

                </form>
            </Paper>


        );
    }
}

export default PasswordReset;
