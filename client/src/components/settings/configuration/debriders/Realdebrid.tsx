import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import CancelCircle from '@material-ui/icons/CancelOutlined';
import CheckCircle from '@material-ui/icons/CheckCircle';
import React, {useEffect} from "react";
import {useDispatch, useSelector} from 'react-redux';
import {ConnectedStateEnum} from '../../../../ducks/ConnectedState.enum';
import {
    disconnectRealdebrid,
    getRealdebridConnectedState,
    listenRealdebridIsConnectedState
} from '../../../../ducks/debriders/Realdebrid.slice';

type RealdebridProps = {

}

type RealdebridDisconnectDto = {
    message: string;
}

const Realdebrid = (props: RealdebridProps) => {

    const dispatch = useDispatch();
    // To use when understood why created selector in slice "breaks the re render"
    // const isConnected = useSelector(getRealdebridConnectedState);
    const connectedState = useSelector((state: any) => state.debriders.realdebrid.connectedState)

    // Production redirect Realdebrid URL - TODO: change the domain name by an environment variable
    let redirectUri = 'https://api.real-debrid.com/oauth/v2/auth?client_id=GPA2MB33HLS3I&redirect_uri=https%3A%2F%2Flazyker.ghyslain.xyz/api/link_rd&response_type=code&state=foobar';

    // Only for development purposes
    if (process.env.NODE_ENV === 'development') {
        redirectUri = 'https://api.real-debrid.com/oauth/v2/auth?client_id=GPA2MB33HLS3I&redirect_uri=http%3A%2F%2Flocalhost:3000/link_rd&response_type=code&state=foobar';
    }

    useEffect(() => {
        dispatch(listenRealdebridIsConnectedState);
    }, []);

    // TODO: refactor
    return (
        <Grid container spacing={0}>
            { connectedState === ConnectedStateEnum.CONNECTED ?
                <Grid item xs={12} style={{padding: '6px'}}>

                    <div style={{display: 'flex'}}>
                        <div style={{flex: '1', marginTop: '10px'}}>
                            Connection
                        </div>

                        <div style={{flex: '1', marginTop: '10px'}}>
                            <CheckCircle style={{fontSize: '20', color: '#00f429'}}/>
                        </div>

                        <div style={{flex: '1'}}>
                            {/*// @ts-ignore*/}
                            <Button variant="outlined" onClick={() => dispatch(disconnectRealdebrid())}>
                                Disconnect
                            </Button>
                        </div>
                    </div>

                </Grid>
                :
                <Grid item xs={12} style={{padding: '6px'}}>

                    <div style={{display: 'flex'}}>
                        <div style={{flex: '1', marginTop: '10px'}}>
                            Connection
                        </div>

                        <div style={{flex: '1', marginTop: '10px'}}>
                            <CancelCircle style={{fontSize: '20', color: '#f44336'}}/>
                        </div>

                        <div style={{flex: '1'}}>
                            <Button variant="outlined" href={redirectUri}>
                                Connect
                            </Button>
                        </div>
                    </div>

                </Grid>
            }
        </Grid>
    )
}

export default Realdebrid;
