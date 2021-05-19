import {makeStyles} from '@material-ui/core';
import CancelCircle from '@material-ui/icons/CancelOutlined';
import CheckCircle from '@material-ui/icons/CheckCircle';
import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ConnectedStateEnum} from '../../../../../../../feature/ConnectedState.enum';
import {listenTokenState} from '../../../../../../../feature/storage/Uptobox.slice';

const useStyles = makeStyles({
  container: {
    flex: 1,
    display: 'flex',
  },
  itemIcon: {
    flex: 1,
    fontSize: 20,
    alignSelf: 'center'
  }
})

export const UptoboxMoviesState = () => {
  const moviesState = useSelector((state: any) => state.uptobox.moviesState);
  const classes = useStyles();

  useEffect(() => {

  }, []);

  switch(moviesState) {
    case ConnectedStateEnum.CONNECTED: {
      return <div className={classes.container}><CheckCircle className={classes.itemIcon} style={{ color: '#00f429' }}/></div>
    }

    case ConnectedStateEnum.DISCONNECTED: {
      return <div className={classes.container}><CancelCircle className={classes.itemIcon} style={{ color: '#f44336' }}/></div>
    }

    default: {
      return <div className={classes.container}><CancelCircle className={classes.itemIcon} style={{color: '#f44336'}}/></div>
    }
  }
}
