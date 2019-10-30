import React from 'react';
import { withRouter } from "react-router-dom";
import DialogContentText from "./SignIn";
import Avatar from "@material-ui/core/Avatar";
import VerticalLinearStepper from "./VerticalStepper";

function HomePage() {
    return (
        <div className="homePage">

            <div className="iconHomePageContainer">
                {/*<img*/}
                    {/*className="iconHomePage"*/}
                    {/*src={require('../assets/icon.png')}*/}
                    {/*alt='application logo'*/}
                {/*/>*/}

                <Avatar alt="Lazyker icon" src={require('../assets/icon.png')} className="iconHomePage" />

                <p style={{fontSize: '30px'}}>
                    Lazyker
                </p>
            </div>

            {/*<div className="homePageText">*/}
                {/*It is a web application that helps you manage your library.*/}
                {/*<br/>*/}
                {/*You can download new medias in 2 supported storage : Google Drive or a Synoloy NAS.*/}
                {/*<br/>*/}
                {/*For a better understanding of the whole application, I invite you to read the <a href="/privacy_policy">privacy policies</a>.*/}
            {/*</div>*/}

            <VerticalLinearStepper/>

        </div>
    );
}

export default withRouter(HomePage);
