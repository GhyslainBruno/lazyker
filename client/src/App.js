import React, { Component } from 'react';
import { auth } from './firebase/firebase';
import './App.css';
import Shows from './components/Shows';
import Navigation from './components/Navigation';
import Movies from './components/Movies';
import Downloads from './components/Downloads';
import Settings from './components/Settings';
import Privacy from './components/privacy/PrivacyPolicies';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';
import {SignUpForm} from "./components/SignUp";
import {SignInForm} from "./components/SignIn";
import CircularProgress from "@material-ui/core/CircularProgress";

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
            navigation: null,
            authUser: null,
            userLoading: true
        }
    }

    componentDidMount() {
        this.setState({userLoading: true});
        auth.onAuthStateChanged(authUser => {
            this.setState({userLoading: false});
            authUser
                ? this.setState({ authUser })
                : this.setState({ authUser: null });
        });
    }

    changeNavigation = (target) => {
        this.setState({ navigation: target });
    };

    render() {
        return (
            <Router>
                <MuiThemeProvider theme={theme}>

                    {

                        this.state.userLoading ?

                            <div className="mainApp mui-fixed" >
                                <div style={{width: '100%', marginTop: '50vh', textAlign: 'center'}}>
                                    <CircularProgress style={this.state.userLoading ? {display: 'inline-block'} : {display: 'none'}}/>
                                </div>
                            </div>

                            :

                            this.state.authUser ?
                                <div className="mainApp mui-fixed">
                                    <Route exact path='/shows' render={() =><Shows changeNavigation={this.changeNavigation}/>}/>
                                    <Route exact path='/movies' render={() => <Movies changeNavigation={this.changeNavigation} />}/>
                                    <Route exact path='/downloads' render={() => <Downloads changeNavigation={this.changeNavigation}/>}/>
                                    <Route exact path='/settings' render={() => <Settings changeNavigation={this.changeNavigation}/>}/>
                                    <Route exact path='/privacy_policy' render={() => <Privacy/>}/>
                                    <Route exact path='/' render={()=> <Movies changeNavigation={this.changeNavigation} />}/>
                                    <Route path='/api/link_rd' render={(props)=> <Settings changeNavigation={this.changeNavigation} {...props} />}/>
                                    <Route path='/' render={() => <Navigation navigation={this.state.navigation} authUser={this.state.authUser} />}/>
                                </div>
                                :
                                <div className="mainApp mui-fixed" style={{paddingBottom: '80px'}}>
                                    <Route exact path='/signup' render={() =><SignUpForm />}/>
                                    <Route exact path='/privacy_policy' render={() => <Privacy/>}/>
                                    <Route path={/^(?!.*(signup|privacy_policy)).*$/} render={() =><SignInForm />}/>
                                </div>

                    }


                </MuiThemeProvider>
            </Router>
        )
    }
}


export default App