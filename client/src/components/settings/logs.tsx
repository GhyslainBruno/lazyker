import React, { useState } from 'react';
import {auth} from "../../firebase";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import AccordionActions from "@material-ui/core/AccordionActions";
import Button from "@material-ui/core/Button";
import ClearLogs from "@material-ui/icons/ClearAll";
import Accordion from "@material-ui/core/Accordion";

type LoadOutputDto = LogDto[]

type LogDto = {
    textPayload: string;
    timestamp: {
        seconds: number;
    }
}

type ClearLogsDto = {
    message: string;
}

type Log = {
    text: string;
    time: number;
}

type LogsProps = {
    displaySnackMessage: (message: string) => void;
};

const Logs = (props: LogsProps) => {

    const [logs, setLogs] = useState<Log[]>([]);
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
            const responseJSON: LoadOutputDto = await response.json();
            setLogs(responseJSON.map(el => {return {text: el.textPayload, time: el.timestamp.seconds * 1000}}));
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

            const responseJSON: ClearLogsDto = await response.json();
            props.displaySnackMessage(responseJSON.message);
            await loadOutput();
        } catch(error) {
            props.displaySnackMessage('Error clearing logs')
        }

    };

    return (
        <Accordion onChange={(event, expanded) => expanded ? loadOutput() : null}>

            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Output</Typography>
            </AccordionSummary>

            <AccordionDetails style={{maxHeight: '50vh', overflow: 'auto'}}>
                <div style={loading ? {display: 'inline-block', width: '100%', textAlign: 'center'} : {display: 'none'}}>
                    <CircularProgress />
                </div>


                <List dense={true}>

                    {logs.map((log, index) => {

                        return (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={log.text}
                                    secondary={new Date(log.time).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute: 'numeric' })}
                                />
                            </ListItem>
                        )

                    })}

                </List>

            </AccordionDetails>

            <Divider />

            <AccordionActions>
                <Button
                    size="small"
                    onClick={clearLogs}>

                    <ClearLogs />
                </Button>
            </AccordionActions>

        </Accordion>
    );
};

export default Logs
