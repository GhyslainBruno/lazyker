import React from 'react';
import { withRouter } from "react-router-dom";
import DialogContentText from "./SignIn";
import Avatar from "@material-ui/core/Avatar";
import VerticalLinearStepper from "./VerticalStepper";

function HomePage() {
    return (
        <div className="homePage">

            <div className="iconHomePageContainer">

                <Avatar alt="Lazyker icon" src={require('../assets/icon.png')} className="iconHomePage" />

                <p style={{fontSize: '30px'}}>
                    Lazyker
                </p>
            </div>

            <VerticalLinearStepper/>

        </div>
    );
}

export default withRouter(HomePage);
