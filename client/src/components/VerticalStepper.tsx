import React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

function getSteps() {
    return ['What is it', 'How it works', 'What is mandatory', 'Who we are'];
}

function getStepContent(step: number) {
    switch (step) {
        case 0:
            return <div>
                Lazyker is a <a href="https://developers.google.com/web/progressive-web-apps">Progressive Web Application</a> that allows you manage downloads of media content.
                For example, you can download movies or Tv Shows directly into the media storage that your media center software uses to display the videos.
                <br/>
                <a href="https://www.plex.tv/fr/">Plex</a> and <a href="https://kodi.tv/">Kodi</a> are good examples of such a thing.
                <br/>
                Qualities of medias can be specified, episodes or full seasons can also be downloaded into in personal libraries, and new episodes freshly aired can be downloaded automatically.
            </div>;
        case 1:
            return <div>
                For now, Lazyker uses <a href="https://www.yggtorrent.gg/">torrents</a> to download medias into your libraries, through a <a href="https://wikipedia.org/wiki/Seedbox">seedbox</a> service known as <a href="https://real-debrid.com/"> RealDebrid</a>.
                <br/>
                As it is possible for you to ask Lazyker to download your medias into your Google Drive personal libraries, a full access to a Google Drive account is necessary if Google Drive storage is an option for you.
                <br/>
                Otherwise, you can still use it with a Synology NAS.
                <br/>
                What Lazyker will do inside your Google Drive account :
                <ul>
                    <li>Read Tv Shows (a particular folder has to be specified for Tv Shows access)</li>
                    <li>Write Tv Shows medias into your library</li>
                    <li>Read Movies (a particular folder has to be specified for Movies access)</li>
                    <li>Write Movies medias into your library</li>
                </ul>
                And that's totally all !

                <br/>
                <br/>

                More information can be found in our <a href="/privacy_policy"> privacy policies</a>.
            </div>;
        case 2: return <div>
            Several things are mandatory to be able to use Lazyker, they are listed below :
            <ul>
                <li>Real-Debrid <a href="https://real-debrid.com/premium"> premium account</a> (no association between this service and Real Debrid is done)</li>
                <li>A storage accessible from the internet (Google Drive or a NAS Synology). Lazyker is open source, and it actually can be installed any where else. Here is the <a href="https://gitlab.com/ghyslainbruno/lazyker">code</a>.</li>
                <li>(Optional) a media center software to fully enjoy this service (as it is mentionned, Plex or Kodi are good ones).</li>
            </ul>
        </div>;
        case 3:
            return <div>
                I am, for now, the only one developer and maintainer of this service.
                <br/>I am developing it only on my free time, and as a free service (which can be pretty complicated sometimes).
                <br/>Here are some ways where I can be contacted :
                <ul>
                    <li>Gitlab : <a href="https://gitlab.com/ghyslainbruno/lazyker">Repository</a></li>
                    <li>Mail : <a href="mailto:ghyslainbruno@gmail.com">ghyslainbruno@gmail.com</a></li>
                </ul>
                <br/>
                A complete list of issues/features can be found at this <a href="https://gitlab.com/ghyslainbruno/lazyker/-/boards/781495">address</a>.
                <br/>
                <br/>
                You can help the support and development of Lazyker by <a href="https://www.buymeacoffee.com/81zHCFM" >buying me a coffee</a> :-).
            </div>;
        default:
            return 'Unknown step';
    }
}

export default function VerticalLinearStepper() {
    // const classes = useStyles();
    const [activeStep, setActiveStep] = React.useState(0);
    const steps = getSteps();

    const handleNext = () => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    return (
        <div>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                        <StepContent>
                            <Typography component={'span'}>{getStepContent(index)}</Typography>
                            <div>
                                <div>
                                    <Button
                                        disabled={activeStep === 0}
                                        onClick={handleBack}
                                        style={{margin: '10px'}}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        style={{margin: '10px'}}
                                        onClick={handleNext}
                                    >
                                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                    </Button>
                                </div>
                            </div>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
            {activeStep === steps.length && (
                <Paper square elevation={0}>
                    <Typography style={{marginLeft: '30px', marginRight: '30px'}}>All steps completed - by clicking "I understand" you understand that Lazyker will ask you full access to a Google Drive account.</Typography>
                    <Button onClick={handleReset} style={{margin: '20px'}}>
                        Reset
                    </Button>
                    <Button href="/signin" style={{margin: '20px'}}>
                        I understand
                    </Button>
                </Paper>
            )}
        </div>
    );
}
