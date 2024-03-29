import React, { Component } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Torrents from './downloads/Torrents';
import MoviesInProgress from './downloads/MoviesInProgress';
import CurrentDownloads from './downloads/CurrentDownloads';

type DownloadsProps = {
    changeNavigation: (location: any) => void;
}

type DownloadsState = {
    snack: boolean;
    snackBarMessage: string | null;

}

class Downloads extends Component<DownloadsProps, DownloadsState> {

    constructor(props: DownloadsProps)
    {
        super(props);
        this.state = {
            snack: false,
            snackBarMessage: null
        };

        props.changeNavigation('downloads');

    }

    displaySnackMessage = (message: string) => {
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
                    {/*<MoviesInProgress*/}
                    {/*    displaySnackMessage={this.displaySnackMessage}*/}
                    {/*/>*/}

                    {/* Torrents */}
                    <Torrents
                        displaySnackMessage={this.displaySnackMessage}
                    />

                    {/* Current Downloads  */}
                    <CurrentDownloads />
                </div>

            </div>
        )
    }
}

export default Downloads
