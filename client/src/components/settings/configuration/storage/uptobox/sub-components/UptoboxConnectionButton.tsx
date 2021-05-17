import {makeStyles} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import {Edit} from '@material-ui/icons';
import Link from '@material-ui/icons/Link';
import LinkOff from '@material-ui/icons/LinkOff';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ConnectedStateEnum} from '../../../../../../feature/ConnectedState.enum';
import {deleteToken, openTokenDialog, updateConnectedState} from '../../../../../../feature/storage/Uptobox.slice';

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

export const UptoboxConnectionButton = () => {
  const connectedState = useSelector((state: any) => state.storage.connectedState);
  const dispatch = useDispatch();
  const classes = useStyles();

  switch(connectedState) {
    case ConnectedStateEnum.CONNECTED: {
      return <div className={classes.container}>
        <div className={classes.itemIcon}>
          <IconButton onClick={() => dispatch(openTokenDialog(true))}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => dispatch(deleteToken())}>
            <LinkOff />
          </IconButton>
        </div>
      </div>
    }

    case ConnectedStateEnum.DISCONNECTED: {
      return <div className={classes.container}><div className={classes.itemIcon}><IconButton onClick={() => dispatch(openTokenDialog(true))}><Link/></IconButton></div></div>
    }

    default: {
      return <div className={classes.container}><div className={classes.itemIcon}><IconButton onClick={() => dispatch(updateConnectedState(ConnectedStateEnum.CONNECTED))}><Link/></IconButton></div></div>
    }
  }
}
