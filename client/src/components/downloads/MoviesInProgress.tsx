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
import firebase from "firebase";

const usersRef = firebase.database().ref('/users');

type MyProps = {
    displaySnackMessage: (message: string) => void;
};
type MyState = {
    moviesInProgress: any;
    total: number;
    moviesInProgressLoading: boolean;
};

class MoviesInProgress extends React.Component<MyProps, MyState> {

    constructor(props: any)
    {
        super(props);
        this.state = {
            moviesInProgress: null,
            total: 0,
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
            usersRef.child(await auth.getUid()).child('/movies').on('value', (snapshot: any) => {
                const inProgressMovies: [] = [];
                snapshot.forEach((movie: any) => {
                    // @ts-ignore
                    inProgressMovies.push(movie.val());
                });

                this.setState({
                    moviesInProgress: inProgressMovies,
                    total: inProgressMovies.length
                })
            });
            this.setState({moviesInProgressLoading: false});
        } catch(error) {
            this.props.displaySnackMessage('Error loading movies in progress');
        }
    };

    /**
     * Remove a particular in progress movie
     */
    removeInProgressMovie = async (movie: any) => {

        try {
            // TODO trigger the kill of the spawn to stop the "in progress" state (but first to it using a spawn...)
            await usersRef.child(await auth.getUid()).child('/movies').child(movie.id.replace(/\./g, '').replace(/#/g, '').replace(/\$/g, '').replace(/\[/g, '').replace(/]/g, '')).remove();
            this.props.displaySnackMessage('Movie removed');
        } catch(error) {
            this.props.displaySnackMessage('Error removing the movie');
        }
    };

    render() {
        return (

            <ExpansionPanel onChange={(event, expanded) => expanded ? this.loadMoviesInProgress() : null}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Medias in progress</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{textAlign: 'center'}}>

                    <List component="nav" style={{width: '100%'}}>

                        <CircularProgress style={this.state.moviesInProgressLoading ? {display: 'inline-block'} : {display: 'none'}} />

                        { this.state.total > 0 ? this.state.moviesInProgress.map((movie: any) => {

                                return (
                                    <ListItem button>
                                        <ListItemText primary={
                                            <React.Fragment>
                                            <Typography component="span" style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} color="textPrimary">
                                                {movie.title}
                                            </Typography>
                                        </React.Fragment>
                                        }/>

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
