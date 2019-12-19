import React, { useState, useEffect } from 'react';
import {auth} from "../../firebase";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import ExpansionPanelActions from "@material-ui/core/ExpansionPanelActions";
import Button from "@material-ui/core/Button";
import ClearLogs from "@material-ui/icons/ClearAll";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";

const Logs = props => {

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadOutput = async () => {
        try {
            setLoading(true);
            setLogs([]);

            let response = await fetch('/api/logs', {
                method: 'GET',
                headers: {
                    'token': await auth.getIdToken()
                }
            });
            response = await response.json();
            setLogs(response.map(el => {return {text: el.textPayload, time: el.timestamp.seconds * 1000}}));
            setLoading(false);

        } catch(error) {
            setLoading(false);
            props.displaySnackMessage('Error fetching logs');
            setLogs([]);
        }

    };

    const clearLogs = async () => {
        try {
            setLoading(true);
            setLogs([]);

            let response = await fetch('/api/logs', {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    logs: 'logs'
                })
            });

            response = await response.json();
            props.displaySnackMessage(response.message);
            await loadOutput();
        } catch(error) {
            props.displaySnackMessage('Error clearing logs')
        }

    };

    return (
        <ExpansionPanel onChange={(event, expanded) => expanded ? loadOutput() : null}>

            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Output</Typography>
            </ExpansionPanelSummary>

            <ExpansionPanelDetails style={{maxHeight: '50vh', overflow: 'auto'}}>
                <div style={loading ? {display: 'inline-block', width: '100%', textAlign: 'center'} : {display: 'none'}}>
                    <CircularProgress />
                </div>


                <List dense={true}>

                    {logs.map(log => {

                        return (
                            <ListItem>
                                <ListItemText
                                    primary={log.text}
                                    secondary={new Date(log.time).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute: 'numeric' })}
                                />
                            </ListItem>
                        )

                    })}

                </List>

            </ExpansionPanelDetails>

            <Divider />

            <ExpansionPanelActions>
                <Button
                    size="small"
                    onClick={clearLogs}>

                    <ClearLogs />
                </Button>
            </ExpansionPanelActions>

        </ExpansionPanel>
    );
};

export default Logs
