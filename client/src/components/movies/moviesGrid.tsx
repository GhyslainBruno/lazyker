import React from "react";
import Grid from "@material-ui/core/Grid";
// @ts-ignore
import Link from "react-router-dom/Link";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Star from "@material-ui/icons/Star";
import CircularProgress from "@material-ui/core/CircularProgress";
import {Movie} from '../Movies';

type MoviesGridProps = {
    tmdbMovies: Movie[];
    moviesGenre: {
        name: string;
        id: any;
    };
    infiniteLoading: any;
    loading: any;
}

const MoviesGrid = (props: MoviesGridProps) => {
    return (
        <div>
            {props.tmdbMovies !== null ? props.tmdbMovies.length > 0 ?

                <div>

                    {
                        props.moviesGenre.name !== 'Now Playing' &&
                        props.moviesGenre.name !== 'Popular' &&
                        props.moviesGenre.name !== 'Top Rated' &&
                        props.moviesGenre.name !== 'Upcoming' ?
                            <h2>{props.moviesGenre.name} movies</h2>
                            :
                            null
                    }

                    <Grid container spacing={0}>
                        {props.tmdbMovies.map(movie => {

                            return (

                                <Grid item xs={4} style={{padding: '6px'}}>

                                    <Link to={{pathname: `/movies/${movie.id}`, search: `?genre=${props.moviesGenre.id}`}} style={{ textDecoration: 'none', color: 'white' }}>
                                        <Card>

                                            <CardMedia
                                                // onClick={() => this.displayMovieInfo(movie)}
                                                style={{paddingTop: '150%', cursor: 'pointer', WebkitTapHighlightColor: 'transparent'}}
                                                image={"https://image.tmdb.org/t/p/w500" + movie.posterPath}
                                                title={movie.title}
                                                // clickable="true"
                                            />

                                            <CardContent>
                                                <div>
                                                    <Star style={{fontSize: '18', verticalAlign: 'bottom'}}/>
                                                    {movie.note}
                                                </div>

                                            </CardContent>

                                        </Card>
                                    </Link>

                                </Grid>

                            )

                        })}
                    </Grid>

                    <CircularProgress style={props.infiniteLoading ? {display: 'inline-block', marginTop: '40px'} : {display: 'none'}}/>

                </div>

                :

                <CircularProgress style={

                    props.loading ?

                        props.infiniteLoading ?

                            {display: 'none'}
                            :
                            {display: 'none'}

                        :
                        props.infiniteLoading ?

                            {display: 'inline-block', marginTop: '40px'}
                            :
                            {display: 'none'}}

                />

                :

                <div>
                    <CircularProgress style={props.infiniteLoading ? {display: 'inline-block', marginTop: '40px'} : {display: 'none'}}/>
                    <div style={
                        props.loading ?

                            props.infiniteLoading ?

                                {display: 'none'}
                                :
                                {display: 'none'}

                            :
                            props.infiniteLoading ?

                                {display: 'none'}
                                :
                                {display: 'inline-block', padding: '30px', color: 'grey'}
                    }>
                        no results found
                    </div>
                </div>

            }
        </div>
    )
};
export default MoviesGrid
