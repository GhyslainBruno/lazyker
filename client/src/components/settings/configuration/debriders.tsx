import Grid from "@material-ui/core/Grid";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import React from "react";
import {useSelector} from 'react-redux';
import {StorageEnum} from '../../../ducks/storage/Storage.enum';
import {getStorageSelected} from '../../../ducks/storage/Storage.slice';
import {Alldebrid} from "./debriders/Alldebrid";
import Realdebrid from './debriders/Realdebrid';

type DebridersProps = {}

const Debriders = (props: DebridersProps) => {

    const selectedStorage = useSelector(getStorageSelected);

    return (
        <AccordionDetails>
            <Grid container spacing={0}>

                <Grid item xs={12} style={{padding: '6px', textAlign: 'center', color: 'white'}}>
                    Debrider
                </Grid>

                {
                    selectedStorage === StorageEnum.UPTOBOX ?
                        <Alldebrid />
                        :
                        null
                }

                {
                    selectedStorage === StorageEnum.GOOGLE_DRIVE ?
                        <Realdebrid />
                        :
                        null
                }

                {
                    selectedStorage === StorageEnum.NAS ?
                        <Realdebrid />
                        :
                        null
                }

            </Grid>
        </AccordionDetails>
    )
};
export default Debriders
