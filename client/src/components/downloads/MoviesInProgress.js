import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import List from "@material-ui/core/List";
import CircularProgress from "@material-ui/core/CircularProgress";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import Error from "@material-ui/icons/Error";
import Delete from "@material-ui/icons/Delete";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import React from "react";
import * as auth from "../../firebase/auth";

class MoviesInProgress extends React.Component {

    constructor(props)
    {
        super(props);
        this.state = {
            moviesInProgress: {total: 0},
            moviesInProgressLoading: false,
        };
    }

    /**
     * Load all movies in progress - basically finding the best links before starting the download
     * @returns {Promise<void>}
     */
    loadMoviesInProgress = async () => {

        try {
            this.setState({moviesInProgressLoading: true});
            let response = await fetch('/api/movies_in_progress', {
                headers: {
                    'token': await auth.getIdToken()
                }
            });
            const moviesInProgress = await response.json();
            this.setState({moviesInProgress: moviesInProgress, moviesInProgressLoading: false})
        } catch(error) {
            this.setState({currentDownloads: null, snack: true, snackBarMessage: 'Error loading movies in progress', currentDownloadsLoading: false})
        }
    };

    /**
     * Remove a particular in progress movie
     */
    removeInProgressMovie = async (movie) => {

        try {
            let response = await fetch('/api/remove_in_progress_movie', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    movie: movie
                })
            });

            const moviesInProgress = await response.json();

            this.props.displaySnackMessage('Movie removed');
            this.setState({moviesInProgress: moviesInProgress});
        } catch(error) {
            this.props.displaySnackMessage('Error removing the movie');
        }
    };

    render() {
        return (

            <ExpansionPanel onChange={(event, expanded) => expanded ? this.loadMoviesInProgress() : this.setState({moviesInProgress: {total: 0}})}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Movies in progress</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{textAlign: 'center'}}>

                    <List component="nav" style={{width: '100%'}}>

                        <CircularProgress style={this.state.moviesInProgressLoading ? {display: 'inline-block'} : {display: 'none'}} />

                        { this.state.moviesInProgress.total > 0 ? Object.keys(this.state.moviesInProgress.moviesInProgress).map(movieInProgress => {

                                const movie = this.state.moviesInProgress.moviesInProgress[movieInProgress];

                                return (
                                    <ListItem button>
                                        <ListItemText primary={movie.title}/>

                                        <ListItemSecondaryAction>
                                            {movie.state === 'error' ?
                                                <IconButton>
                                                    <Error style={{color: '#ff0000'}}/>
                                                </IconButton>
                                                :
                                                null
                                            }

                                            <IconButton>
                                                <Delete onClick={() => this.removeInProgressMovie(movie)} />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                )
                            })
                            :

                            <div style={this.state.moviesInProgressLoading ? {display: 'none'} : {padding: '10px', fontSize: '0.9rem', color: 'grey'}}>no movies in progress</div>

                        }

                    </List>

                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }
}

export default MoviesInProgress