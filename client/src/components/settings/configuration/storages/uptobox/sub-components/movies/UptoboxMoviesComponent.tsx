import {makeStyles} from '@material-ui/core';
import React from 'react';
import {UptoboxMoviesButton} from './UptoboxMoviesButton';
import {UptoboxMoviesState} from './UptoboxMoviesState';
import {UptoboxSelectMovieDialog} from './UptoboxSelectMovieDialog';

const useStyles = makeStyles({
  container: {
    flex: 1,
    display: 'flex',
  },
  itemText: {
    flex: 1,
    alignSelf: 'center'
  },
})

export const UptoboxMoviesComponent = () => {
  const classes = useStyles();

  return (
    <div style={{display: 'flex'}}>

      <UptoboxSelectMovieDialog id={'/'} label={'Uptobox folders'}/>

      <div className={classes.container}>
        <div className={classes.itemText}>
          Movies
        </div>
      </div>

      <UptoboxMoviesState/>

      <UptoboxMoviesButton/>
    </div>
  )
}
