import React, { Component } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Torrents from './downloads/Torrents';
import MoviesInProgress from './downloads/MoviesInProgress';
import CurrentDownloads from './downloads/CurrentDownloads';

class Downloads extends Component {

    constructor(props)
    {
        super(props);
        this.state = {
            snack: false,
            snackBarMessage: null
        };

        props.changeNavigation('downloads');

    }

    displaySnackMessage = message => {
        this.setState({snack: true, snackBarMessage: message});
    };


    render() {
        return (
            <div style={{marginBottom: '10vh'}}>

                <Snackbar

                    open={this.state.snack}
                    onClose={() => this.setState({snack: false})}
                    autoHideDuration={2000}
                    message={this.state.snackBarMessage}
                />

                <h1>Downloads</h1>

                <div>
                    {/* Movies in Progress */}
                    <MoviesInProgress
                        displaySnackMessage={this.displaySnackMessage}
                    />

                    {/* Torrents */}
                    <Torrents
                        displaySnackMessage={this.displaySnackMessage}
                    />

                    {/* Current Downloads  */}
                    <CurrentDownloads
                        displaySnackMessage={this.displaySnackMessage}
                    />
                </div>

            </div>
        )
    }
}

export default Downloads