import Grid from "@material-ui/core/Grid";
import CheckCircle from "@material-ui/icons/CheckCircle";
import Button from "@material-ui/core/Button";
import CancelCircle from "@material-ui/icons/CancelOutlined";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import React from "react";
import {Alldebrid} from "./debriders/Alldebrid";

type DebridersProps = {
  realdebrid: boolean;
  realdebridDisconnect: () => {};
}

const Debriders = (props: DebridersProps) => {

    // Production redirect Realdebrid URL - TODO: change the domain name by an environment variable
    let redirectUri = 'https://api.real-debrid.com/oauth/v2/auth?client_id=GPA2MB33HLS3I&redirect_uri=https%3A%2F%2Flazyker.ghyslain.xyz/api/link_rd&response_type=code&state=foobar';

    // Only for development purposes
    if (process.env.NODE_ENV === 'development') {
        redirectUri = 'https://api.real-debrid.com/oauth/v2/auth?client_id=GPA2MB33HLS3I&redirect_uri=http%3A%2F%2Flocalhost:3000/link_rd&response_type=code&state=foobar';
    }

    return (
        <AccordionDetails>
            <Grid container spacing={0}>

                <Grid item xs={12} style={{padding: '6px', textAlign: 'center', color: 'white'}}>
                    Debriders
                </Grid>

              <Alldebrid/>

                {
                    props.realdebrid ?
                        <Grid item xs={12} style={{padding: '6px'}}>

                            <div style={{display: 'flex'}}>
                                <div style={{flex: '1', marginTop: '10px'}}>
                                    Realdebrid
                                </div>

                                <div style={{flex: '1', marginTop: '10px'}}>
                                    <CheckCircle style={{fontSize: '20', color: '#00f429'}}/>
                                </div>

                                <div style={{flex: '1'}}>
                                    <Button variant="outlined" onClick={props.realdebridDisconnect}>
                                        Disconnect
                                    </Button>
                                </div>
                            </div>

                        </Grid>
                        :
                        <Grid item xs={12} style={{padding: '6px'}}>

                            <div style={{display: 'flex'}}>
                                <div style={{flex: '1', marginTop: '10px'}}>
                                    Realdebrid
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
        </AccordionDetails>
    )
};
export default Debriders
