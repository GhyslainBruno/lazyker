import React from "react";
import { useSelector, useDispatch } from 'react-redux'
import {isConnected} from "../../../../feature/debriders/alldebridSlice";
import CheckCircle from "@material-ui/icons/CheckCircle";
import CancelCircle from "@material-ui/icons/CancelOutlined";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

export const Alldebrid = () => {

  const pinStatus = useSelector((state) => state.debriders.pinStatus);
  const isConnectedState = useSelector((state) => state.debriders.isConnected);
  const dispatch = useDispatch()


  return (
    <Grid container spacing={0}>

      {
        isConnectedState ?
          <Grid item xs={12} style={{padding: '6px'}}>

            <div style={{display: 'flex'}}>
              <div style={{flex: '1', marginTop: '10px'}}>
                Alldebrid
              </div>

              <div style={{flex: '1', marginTop: '10px'}}>
                <CheckCircle style={{fontSize: '20', color: '#00f429'}}/>
              </div>

              <div style={{flex: '1'}}>
                <Button variant="outlined" onClick={() => dispatch(isConnected(false))}>
                  Disconnect
                </Button>
              </div>
            </div>

          </Grid>
          :
          <Grid item xs={12} style={{padding: '6px'}}>

            <div style={{display: 'flex'}}>
              <div style={{flex: '1', marginTop: '10px'}}>
                Alldebrid
              </div>

              <div style={{flex: '1', marginTop: '10px'}}>
                <CancelCircle style={{fontSize: '20', color: '#f44336'}}/>
              </div>

              <div style={{flex: '1'}}>
                <Button variant="outlined" onClick={() => dispatch(isConnected(true))}>
                  Connect
                </Button>
              </div>
            </div>

          </Grid>
      }
    </Grid>
  )

}
