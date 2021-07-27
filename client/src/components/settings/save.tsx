import Button from "@material-ui/core/Button";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import React from "react";

type SaveProps = {
  setSettings: () => {};
}

const Save = (props: SaveProps) => {
    return (
        <AccordionDetails style={{padding: '24px'}}>
            <Button variant="outlined" onClick={props.setSettings} style={{margin: 'auto 0 auto auto'}}>
                Save
            </Button>
        </AccordionDetails>
    )
};
export default Save
