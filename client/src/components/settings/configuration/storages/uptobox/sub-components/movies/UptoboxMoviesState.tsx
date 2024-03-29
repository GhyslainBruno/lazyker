import {makeStyles} from '@material-ui/core';
import Chip from '@material-ui/core/Chip/Chip';
import CancelCircle from '@material-ui/icons/CancelOutlined';
import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ConnectedStateEnum} from '../../../../../../../ducks/ConnectedState.enum';
import {
  deleteMoviesFolder, listenMoviesFolder,
} from '../../../../../../../ducks/storages/Uptobox.slice';

const useStyles = makeStyles({
  container: {
    flex: 1,
    display: 'flex',
  },
  itemIcon: {
    flex: 1,
    fontSize: 20,
    alignSelf: 'center'
  },
  chip: {
    overflow: 'hidden',
    maxWidth: '200px'
  }
})

export const UptoboxMoviesState = () => {
  const moviesState = useSelector((state: any) => state.storages.uptobox.moviesState);
  const moviesFolderPath = useSelector((state: any) => state.storages.uptobox.moviesFolderPath);
  const dispatch = useDispatch();
  const classes = useStyles();

  useEffect(() => {
    listenMoviesFolder(dispatch);
  }, []);

  switch(moviesState) {
    case ConnectedStateEnum.CONNECTED: {
     return (
       <div className={classes.container}>
         <div className={classes.itemIcon}>
           <Chip
             size="medium"
             className={classes.chip}
             label={moviesFolderPath.replace('//','/')}
             // TODO: understand why I need to ignore these errors
             // @ts-ignore
             onDelete={() => dispatch(deleteMoviesFolder())}
           />
         </div>
       </div>
     )
    }

    case ConnectedStateEnum.DISCONNECTED: {
      return <div className={classes.container}><CancelCircle className={classes.itemIcon} style={{ color: '#f44336' }}/></div>
    }

    default: {
      return <div className={classes.container}><CancelCircle className={classes.itemIcon} style={{color: '#f44336'}}/></div>
    }
  }
}
