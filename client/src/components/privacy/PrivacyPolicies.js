import React from 'react'

const PrivacyPolicies = () => (
    <div style={{marginBottom: '10vh'}}>
        <h1> Google Data usages </h1>

        <h2> Google authentication </h2>

        <p>
            You can be logged in Lazyker using the Google provider, we do not store any data about your personal account, except your session tokens, in a Firebase database.
        </p>

        <h2> Google Drive </h2>

        <h3> Folders </h3>
        <p>
            When you are asked about choosing a movies/tv shows folder where to put your medias into your Google Drive account, when then store the data that identify these folders,
            so that our backend server is able to upload the medias you want in these places. No other personal data is stored by us.
        </p>

        <h3> Link </h3>
        <p>
            To be able to upload the medias wanted in the user's Google Drive folders, our back end server needs to have access to the user Google Drive data.
            In order to do so, when a user clicks the "link" icon in Settings/Storage/Google Drive, a single use code is sent to our backend server, and only it can then get an access token from this particular user.
            This token is then stored in our user database, so that the backend server can, when the user wants, upload medias to the user's Google Drive files.
        </p>


        <h2>
            In general
        </h2>
        <p>
            No credentials are stored by Lazyker.
            This application is not aimed to be used in a global way, and we do not use, store or access your data in an overkill way.
        </p>

        <h1>Realdebrid data usages</h1>

        <p>
            When only store an access token used by the Realdebrid service to access the user endpoints of the Realdebrid API when it is needed.
        </p>

    </div>
);

export default PrivacyPolicies