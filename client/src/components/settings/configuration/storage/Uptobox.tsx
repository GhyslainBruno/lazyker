import IconButton from '@material-ui/core/IconButton';
import CancelCircle from '@material-ui/icons/CancelOutlined';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Link from '@material-ui/icons/Link';
import LinkOff from '@material-ui/icons/LinkOff';
import React from "react";
import {useDispatch, useSelector} from 'react-redux';
import {Dispatch} from 'redux';
import {ConnectedStateEnum} from '../../../../feature/ConnectedState.enum';
import {openTokenDialog, updateConnectedState} from '../../../../feature/storage/Uptobox.slice';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  container: {
    display: 'flex',
  },
  item: {
    flex: 1,
    fontSize: 20,
  },
})

const UptoboxConnectionState = () => {
  const connectedState = useSelector((state: any) => state.storage.connectedState);
  const classes = useStyles();

  switch(connectedState) {
    case ConnectedStateEnum.CONNECTED: {
      return <div className={classes.container}><CheckCircle className={classes.item} style={{ color: '#00f429' }}/></div>
    }

    case ConnectedStateEnum.DISCONNECTED: {
      return <div className={classes.container}><CancelCircle className={classes.item} style={{ color: '#f44336' }}/></div>
    }

    default: {
      return <div className={classes.container}><CancelCircle className={classes.item} style={{color: '#f44336'}}/></div>
    }
  }
}

const UptoboxConnectionButton = () => {
  const connectedState = useSelector((state: any) => state.storage.connectedState);
  const dispatch = useDispatch();

  switch(connectedState) {
    case ConnectedStateEnum.CONNECTED: {
      return <div style={{flex: '1'}}><IconButton><LinkOff onClick={() => dispatch(updateConnectedState(ConnectedStateEnum.DISCONNECTED))}/></IconButton></div>
    }

    case ConnectedStateEnum.DISCONNECTED: {
      return <div style={{flex: '1'}}><IconButton onClick={() => dispatch(updateConnectedState(ConnectedStateEnum.CONNECTED))}><Link/></IconButton></div>
    }

    default: {
      return <div style={{flex: '1'}}><IconButton onClick={() => dispatch(updateConnectedState(ConnectedStateEnum.CONNECTED))}><Link/></IconButton></div>
    }
  }
}

const UptoboxLinkedComponent = () => {

  return (
    <div style={{display: 'flex'}}>

      <div style={{flex: '1'}}>
        Link
      </div>

      <UptoboxConnectionState />

      <UptoboxConnectionButton />
    </div>
  )
}

export const Uptobox = () => {

  return (
    <div style={{width: '100%'}}>
        <UptoboxLinkedComponent />
    </div>
  )

}
