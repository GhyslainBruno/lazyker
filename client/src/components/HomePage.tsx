import React from 'react';
import { withRouter } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import VerticalLinearStepper from "./VerticalStepper";
import LazykerIcon from '../../icon.png';

function HomePage() {
    return (
        <div className="homePage">

            <div className="iconHomePageContainer">

                <Avatar alt="Lazyker icon" src={LazykerIcon} className="iconHomePage" />

                <p style={{fontSize: '30px'}}>
                    Lazyker
                </p>
            </div>

            <VerticalLinearStepper/>

        </div>
    );
}

export default withRouter(HomePage);
