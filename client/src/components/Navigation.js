import React, { Component } from 'react';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Icon from '@material-ui/core/Icon';
import Tv from '@material-ui/icons/Tv';
import Movie from '@material-ui/icons/Movie';
import GetApp from '@material-ui/icons/GetApp';
import Settings from '@material-ui/icons/Settings';
import '../App.scss';
import Shows from "./Shows";
import {Link} from 'react-router-dom';

class Navigation extends Component {

    render() {

        return(

            <div>

                {
                    this.props.authUser ?
                        <BottomNavigation className="bottomNav" value={this.props.navigation} style={{width: '100%', position: 'fixed', bottom: '0', left: '0', zIndex: '2'}}>
                            <BottomNavigationAction label="Shows" value="shows" component={Link} to="/shows" icon={<Tv />}/>
                            <BottomNavigationAction label="Movies" value="movies" component={Link} to="/movies" icon={<Movie />} />
                            <BottomNavigationAction label="Downloads" value="downloads" component={Link} to="/downloads" icon={<GetApp />} />
                            <BottomNavigationAction label="Settings" value="settings" component={Link} to="/settings" icon={<Settings/>} />
                        </BottomNavigation>
                        :
                        <div>
                            <span>UNAUTHENTICATED</span>
                        </div>
                }

            </div>

        )
    }
}

export default Navigation