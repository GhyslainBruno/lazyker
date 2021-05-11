import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import ArrowBack from "@material-ui/icons/ArrowBack";
import Input from "@material-ui/core/Input";
import Close from "@material-ui/icons/Close";
import Search from "@material-ui/icons/Search";
import Paper from "@material-ui/core/Paper";
import CircularProgress from "@material-ui/core/CircularProgress";
import Chip from "@material-ui/core/Chip";
import React from "react";
import {MovieGenre} from '../Movies';

type SearchMoviesAppBarProps = {
  isInSearchView: boolean;
  cleanSearch: () => {};
  movieTitleToSearch: string;
  getMoviesGenres: () => {};
  updateMovieTitleToSearch: (event: any) => void;
  searchBarLostFocus: (event: any) => void;
  onEnterKeyPressed: (event: any) => void;
  clearTitle: () => void;
  movieGenres: MovieGenre[];
  movieGenresLoading: boolean;
  moviesGenre: MovieGenre;
  searchMovieGenre: (genre: MovieGenre) => void;
  styles: {
    selectedChip: any;
    outlinedChip: any;
  };
  searchMovie: () => void;
}

const SearchMoviesAppBar = (props: SearchMoviesAppBarProps) => {
  return (

        // @ts-ignore
        <div style={{flexGrow: '1'}}>
            <AppBar
                position="static"
                color="default">
                <Toolbar>
                        <IconButton style={props.isInSearchView ? {visibility: 'visible', marginRight: '16px'} : {visibility: 'hidden', marginRight: '16px'}}>
                        <ArrowBack onClick={props.cleanSearch}/>
                    </IconButton>

                    <Input
                        id="movie_title_to_search"
                        value={props.movieTitleToSearch}
                        onClick={props.getMoviesGenres}
                        placeholder="Movie title"
                        autoComplete="off"
                        // type="search"
                        onChange={evt => props.updateMovieTitleToSearch(evt)}
                        onBlur={evt => props.searchBarLostFocus(evt)}
                        disableUnderline={true}
                        style={{width: '80%'}}
                        onKeyPress={(event) => {props.onEnterKeyPressed(event)}}
                    />

                    <IconButton>
                        {props.movieTitleToSearch !== null && props.movieTitleToSearch !== '' ?
                            <Close onClick={props.clearTitle}/>
                            :
                            // @ts-ignore
                            <Search onClick={props.movieTitleToSearch !== null && props.movieTitleToSearch !== '' ? () => props.searchMovie : null}/>
                        }
                    </IconButton>

                </Toolbar>
            </AppBar>

            <Paper elevation={1} style={props.movieGenres.length > 0 ? {padding: '5px'} : {display: 'none'}}>

                <CircularProgress style={props.movieGenresLoading ? {display: 'inline-block'} : {display: 'none'}}/>

                {
                    props.movieGenres !== null ? props.movieGenres.map(movieGenre => {
                            return (
                                <Chip label={movieGenre.name} style={props.styles.outlinedChip} className="movieGenre" clickable={true} onClick={() => props.searchMovieGenre(movieGenre)} />
                            )
                        })
                        :
                        null
                }

            </Paper>

            <div style={{paddingTop: '10px', paddingBottom: '10px'}}>
                <Chip label="Now Playing" style={props.moviesGenre.name === 'Now Playing' ? props.styles.selectedChip : props.styles.outlinedChip} clickable={true} onClick={() => props.searchMovieGenre({name: "Now Playing", id: "now_playing"})}/>
                <Chip label="Popular" style={props.moviesGenre.name === 'Popular' ? props.styles.selectedChip : props.styles.outlinedChip} clickable={true} onClick={() => props.searchMovieGenre({name: "Popular", id: "popular"})} />
                <Chip label="Top Rated" style={props.moviesGenre.name === 'Top Rated' ? props.styles.selectedChip : props.styles.outlinedChip} clickable={true} onClick={() => props.searchMovieGenre({name: "Top Rated", id: "top_rated"})} />
                <Chip label="Upcoming" style={props.moviesGenre.name === 'Upcoming' ? props.styles.selectedChip : props.styles.outlinedChip} clickable={true} onClick={() => props.searchMovieGenre({name: "Upcoming", id: "upcoming"})} />
            </div>


        </div>
    )
};
export default SearchMoviesAppBar
