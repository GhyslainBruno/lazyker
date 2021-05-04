import Button from "@material-ui/core/Button";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import React from "react";

const Save = props => {
    return (
        <ExpansionPanelDetails style={{padding: '24px'}}>
            <Button variant="outlined" onClick={props.setSettings} style={{margin: 'auto 0 auto auto'}}>
                Save
            </Button>
        </ExpansionPanelDetails>
    )
};
export default Save
