import Chip from '@material-ui/core/Chip/Chip';
import Grid from "@material-ui/core/Grid";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import React, {useEffect} from "react";
import {useDispatch, useSelector} from 'react-redux';
import {fetchDebrider, getDebriderSelected, saveDebrider} from '../../../ducks/debriders/Debrider.slice';
import {DebriderEnum} from '../../../ducks/torrents/debrider.enum';
import {Alldebrid} from "./debriders/Alldebrid";
import Realdebrid from './debriders/Realdebrid';

type DebridersProps = {}

const Debriders = (props: DebridersProps) => {

    const selectedDebrider = useSelector(getDebriderSelected);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchDebrider());
    }, []);

    return (
        <AccordionDetails>
            <Grid container spacing={0}>

                <Grid item xs={12} style={{padding: '6px', textAlign: 'center', color: 'white'}}>
                    Debrider
                </Grid>

                {/* The Chips representing the different debriders */}
                <Grid item xs={12} style={{padding: '6px', textAlign: 'center', color: 'white'}}>
                    <Chip
                        label="Alldebrid"
                        variant={selectedDebrider === DebriderEnum.ALLDEBRID ? "default" : "outlined"}
                        style={{margin: '3px'}}
                        onClick={() => {dispatch(saveDebrider(DebriderEnum.ALLDEBRID))}}/>
                    <Chip
                        label="Realdebrid"
                        variant={selectedDebrider === DebriderEnum.REALDEBRID ? "default" : "outlined"}
                        style={{margin: '3px'}}
                        onClick={() => {dispatch(saveDebrider(DebriderEnum.REALDEBRID))}}/>
                </Grid>

                {
                    selectedDebrider === DebriderEnum.ALLDEBRID ?
                        <Alldebrid />
                        :
                        null
                }

                {
                    selectedDebrider === DebriderEnum.REALDEBRID ?
                        <Realdebrid />
                        :
                        null
                }

            </Grid>
        </AccordionDetails>
    )
};
export default Debriders
