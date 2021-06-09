import Grid from "@material-ui/core/Grid";
import CheckCircle from "@material-ui/icons/CheckCircle";
import Button from "@material-ui/core/Button";
import CancelCircle from "@material-ui/icons/CancelOutlined";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import React from "react";
import {Alldebrid} from "./debriders/Alldebrid";
import Realdebrid from './debriders/Realdebrid';

type DebridersProps = {}

const Debriders = (props: DebridersProps) => {

    return (
        <AccordionDetails>
            <Grid container spacing={0}>

                <Grid item xs={12} style={{padding: '6px', textAlign: 'center', color: 'white'}}>
                    Debrider
                </Grid>

                <Alldebrid />

                <Realdebrid />

                {/*{*/}
                {/*    props.realdebrid ?*/}
                {/*        <Grid item xs={12} style={{padding: '6px'}}>*/}

                {/*            <div style={{display: 'flex'}}>*/}
                {/*                <div style={{flex: '1', marginTop: '10px'}}>*/}
                {/*                    Realdebrid*/}
                {/*                </div>*/}

                {/*                <div style={{flex: '1', marginTop: '10px'}}>*/}
                {/*                    <CheckCircle style={{fontSize: '20', color: '#00f429'}}/>*/}
                {/*                </div>*/}

                {/*                <div style={{flex: '1'}}>*/}
                {/*                    <Button variant="outlined" onClick={props.realdebridDisconnect}>*/}
                {/*                        Disconnect*/}
                {/*                    </Button>*/}
                {/*                </div>*/}
                {/*            </div>*/}

                {/*        </Grid>*/}
                {/*        :*/}
                {/*        <Grid item xs={12} style={{padding: '6px'}}>*/}

                {/*            <div style={{display: 'flex'}}>*/}
                {/*                <div style={{flex: '1', marginTop: '10px'}}>*/}
                {/*                    Realdebrid*/}
                {/*                </div>*/}

                {/*                <div style={{flex: '1', marginTop: '10px'}}>*/}
                {/*                    <CancelCircle style={{fontSize: '20', color: '#f44336'}}/>*/}
                {/*                </div>*/}

                {/*                <div style={{flex: '1'}}>*/}
                {/*                    <Button variant="outlined" href={redirectUri}>*/}
                {/*                        Connect*/}
                {/*                    </Button>*/}
                {/*                </div>*/}
                {/*            </div>*/}

                {/*        </Grid>*/}
                {/*}*/}

            </Grid>
        </AccordionDetails>
    )
};
export default Debriders
