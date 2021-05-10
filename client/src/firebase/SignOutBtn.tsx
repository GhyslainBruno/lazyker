import React from 'react';
import { auth } from './index';
import Button from '@material-ui/core/Button';

const SignOutButton = () =>

    <div style={{width: '100%', display: 'inline-block', textAlign: 'center'}}>
        <Button
            className="signOutBtn"
            // unelevated={true}
            onClick={auth.doSignOut}
            type="button">
            Sign Out
        </Button>
    </div>;




export default SignOutButton;
