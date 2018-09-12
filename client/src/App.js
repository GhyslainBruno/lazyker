import React, { Component } from 'react';
import { auth } from './firebase/firebase';
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
import {SignUpForm} from "./components/SignUp";
import {SignInForm} from "./components/SignIn";

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
            authUser: null
        }
    }

    componentDidMount() {
        auth.onAuthStateChanged(authUser => {
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
                        this.state.authUser ?
                            <div className="mainApp mui-fixed" style={{paddingBottom: '80px'}}>
                                {/* To try firebase signup */}
                                <Route exact path='/signup' render={() =><SignUpForm />}/>
                                <Route exact path='/signin' render={() =><SignInForm />}/>
                                <Route exact path='/shows' render={() =><Shows changeNavigation={this.changeNavigation}/>}/>
                                <Route exact path='/movies' render={() => <Movies changeNavigation={this.changeNavigation} />}/>
                                <Route exact path='/downloads' render={() => <Downloads changeNavigation={this.changeNavigation}/>}/>
                                <Route exact path='/settings' render={() => <Settings changeNavigation={this.changeNavigation}/>}/>
                                {/*<Route exact path='/' render={()=> <Movies changeNavigation={this.changeNavigation} />}/>*/}
                                <Route path='/' render={() => <Navigation navigation={this.state.navigation} authUser={this.state.authUser} />}/>
                            </div>
                            :
                            <div className="mainApp mui-fixed" style={{paddingBottom: '80px'}}>
                                {/* To try firebase signup */}
                                {/*<Route exact path='/signup' render={() =><SignUpForm />}/>*/}
                                <Route path='/' render={() =><SignInForm />}/>
                                {/*<Route exact path='/shows' render={() =><Shows changeNavigation={this.changeNavigation}/>}/>*/}
                                {/*<Route exact path='/movies' render={() => <Movies changeNavigation={this.changeNavigation} />}/>*/}
                                {/*<Route exact path='/downloads' render={() => <Downloads changeNavigation={this.changeNavigation}/>}/>*/}
                                {/*<Route exact path='/settings' render={() => <Settings changeNavigation={this.changeNavigation}/>}/>*/}
                                {/*<Route path='/' render={() => <Navigation navigation={this.state.navigation} authUser={this.state.authUser} />}/>*/}
                            </div>
                    }


                </MuiThemeProvider>
            </Router>
        )
    }
}


export default App