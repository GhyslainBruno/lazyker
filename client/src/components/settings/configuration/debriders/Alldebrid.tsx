import CircularProgress from '@material-ui/core/CircularProgress';
import React from "react";
import { useSelector, useDispatch } from 'react-redux'
import {Dispatch} from 'redux';
import {fetchAlldebridDisconnect, fetchNewPinCode, isConnected} from "../../../../feature/debriders/alldebridSlice";
import CheckCircle from "@material-ui/icons/CheckCircle";
import CancelCircle from "@material-ui/icons/CancelOutlined";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

const Connected = () => {
  return <CheckCircle style={{fontSize: '20', color: '#00f429'}}/>
}

const Disconnected = () => {
  return <CancelCircle style={{fontSize: '20', color: '#f44336'}}/>
}

const Loading = () => {
  return <CircularProgress size={'1rem'}/>
}

type ConnectionStateProps = {
  connectionState: string;
}

const ConnectionState = (props: ConnectionStateProps) => {
  switch (props.connectionState) {
    case 'connected': {
      return <Connected/>
    }

    case 'disconnected': {
      return <Disconnected/>
    }

    case 'loading': {
      return <Loading/>
    }

    default: {
      return <Disconnected/>
    }
  }
}

type ConnectionButtonProps = {
  connectionState: any;
  dispatch: Dispatch<any>;
  pin: string;
  connectionUrl: string;
}

const openInNewTab = (url: string) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

const ConnectionButton = (props: ConnectionButtonProps) => {
  switch (props.connectionState) {
    case 'connected': {
      return <Button variant="outlined" onClick={() => props.dispatch(fetchAlldebridDisconnect())}>Disconnect</Button>
    }

    case 'disconnected': {
      return <Button variant="outlined" onClick={() => props.dispatch(fetchNewPinCode())}>Connect</Button>
    }

    case 'loading': {
      return <div onClick={() => openInNewTab(props.connectionUrl)}>{props.pin}</div>
    }

    default: {
      return <div/>
    }
  }
}

export const Alldebrid = () => {

  const pinStatus = useSelector((state: any) => state.debriders.pinStatus);
  const isConnectedState = useSelector((state: any) => state.debriders.isConnected);
  const loading = useSelector((state: any) => state.debriders.loading);
  const dispatch = useDispatch()


  return (
    <Grid container spacing={0}>

      <Grid item xs={12} style={{padding: '6px'}}>

        <div style={{display: 'flex'}}>
          <div style={{flex: '1', marginTop: '10px'}}>
            Alldebrid
          </div>

          <div style={{flex: '1', marginTop: '10px'}}>

            <ConnectionState connectionState={isConnectedState}/>

          </div>

          <div style={{flex: '1'}}>

            <ConnectionButton connectionState={isConnectedState} dispatch={dispatch} pin={pinStatus.pin} connectionUrl={pinStatus.connectionUrl}/>

          </div>
        </div>

      </Grid>
    </Grid>
  )

}
