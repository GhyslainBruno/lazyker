import React from 'react';
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import OutlinedInput from "@material-ui/core/OutlinedInput/OutlinedInput";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";

type QualitiesProps = {
    firstQuality: any;
    handlerQualityChange: () => {};
    labelWidth: any;
    secondQuality: any;
    thirdQuality: any;
    h265: any;
    handleH265Change: (h265: string) => {};
}

const Qualities = (props: QualitiesProps) => {
    return (
        <ExpansionPanelDetails style={{textAlign: 'center'}}>

            <Grid container spacing={0}>

                <Grid item xs={12} style={{padding: '6px', color: 'white'}}>
                    Qualities wanted
                </Grid>

                <Grid item xs={4} style={{padding: '6px'}}>
                    <FormControl style={{minWidth: '80px'}} variant="outlined">
                        <Select
                            value={props.firstQuality}
                            onChange={props.handlerQualityChange}
                            input={
                                <OutlinedInput
                                    labelWidth={props.labelWidth}
                                    name="firstQuality"
                                    id="first-quality"
                                />
                            }>

                            <MenuItem value="none">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value={'hdtv'}>HDTV</MenuItem>
                            <MenuItem value={'720p'}>720p</MenuItem>
                            <MenuItem value={'1080p'}>1080p</MenuItem>
                        </Select>
                        <FormHelperText>First quality wanted</FormHelperText>
                    </FormControl>
                </Grid>


                <Grid item xs={4} style={{padding: '6px'}}>
                    <FormControl variant="outlined" style={{minWidth: '80px', margin: '0 auto'}}>
                        <Select
                            value={props.secondQuality}
                            onChange={props.handlerQualityChange}
                            input={
                                <OutlinedInput
                                    labelWidth={props.labelWidth}
                                    name="secondQuality"
                                    id="second-quality"
                                />
                            }>

                            <MenuItem value="none">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value={'hdtv'}>HDTV</MenuItem>
                            <MenuItem value={'720p'}>720p</MenuItem>
                            <MenuItem value={'1080p'}>1080p</MenuItem>
                        </Select>
                        <FormHelperText>Second quality wanted</FormHelperText>
                    </FormControl>
                </Grid>


                <Grid item xs={4} style={{padding: '6px'}}>
                    <FormControl style={{minWidth: '80px', margin: '0 auto'}} variant="outlined">
                        <Select
                            value={props.thirdQuality}
                            onChange={props.handlerQualityChange}
                            input={
                                <OutlinedInput
                                    labelWidth={props.labelWidth}
                                    name="thirdQuality"
                                    id="third-quality"
                                />
                            }>


                            <MenuItem value="none">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value={'hdtv'}>HDTV</MenuItem>
                            <MenuItem value={'720p'}>720p</MenuItem>
                            <MenuItem value={'1080p'}>1080p</MenuItem>
                        </Select>
                        <FormHelperText>Third quality wanted</FormHelperText>
                    </FormControl>
                </Grid>

                <Grid item xs={4} style={{padding: '6px'}}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={props.h265}
                                //TODO: check why not overload matches this call
                                // onChange={props.handleH265Change('h265')}
                                value="h265"
                            />
                        }
                        label="H265"
                        style={{margin: '0 auto'}}/>
                </Grid>
            </Grid>
        </ExpansionPanelDetails>
    )
};
export default Qualities
