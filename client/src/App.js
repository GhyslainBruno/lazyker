import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Shows from './components/Shows';
import Navigation from './components/Navigation';
import Movies from './components/Movies';
import Downloads from './components/Downloads';
import Settings from './components/Settings';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';

const theme = createMuiTheme({
    palette: {
        type: 'dark', // Switching the dark mode on is a single property value change.
        primary: red,
        secondary: green,
    },
});

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            navigation: null
        }
    }

    changeNavigation = (target) => {
        this.setState({ navigation: target });
    };

    render() {
        return (
            <Router>
                <MuiThemeProvider theme={theme}>
                    <div className="mainApp mui-fixed" style={{paddingBottom: '80px'}}>
                        <Route exact path='/shows' render={() =><Shows changeNavigation={this.changeNavigation}/>}/>
                        <Route exact path='/movies' render={() => <Movies changeNavigation={this.changeNavigation} />}/>
                        <Route exact path='/downloads' render={() => <Downloads changeNavigation={this.changeNavigation}/>}/>
                        <Route exact path='/settings' render={() => <Settings changeNavigation={this.changeNavigation}/>}/>
                        <Route exact path='/' render={()=> <Movies changeNavigation={this.changeNavigation} />}/>
                        <Route path='/' render={() => <Navigation navigation={this.state.navigation} />}/>
                    </div>
                </MuiThemeProvider>
            </Router>
        )
    }
}


export default App