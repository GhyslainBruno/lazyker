import React from 'react';

import { auth } from '../firebase';
import Button from "@material/react-button";

const SignOutButton = () =>

    <div style={{width: '100%', display: 'inline-block', textAlign: 'center'}}>
        <Button
            className="signOutBtn"
            unelevated={true}
            onClick={auth.doSignOut}
            type="button">
            Sign Out
        </Button>
    </div>;




export default SignOutButton;