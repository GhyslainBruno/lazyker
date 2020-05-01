import React, { Component } from 'react';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Tv from '@material-ui/icons/TvOutlined';
import Movie from '@material-ui/icons/MovieOutlined';
import GetApp from '@material-ui/icons/GetAppOutlined';
import Settings from '@material-ui/icons/SettingsOutlined';
import '../App.scss';
import {Link} from 'react-router-dom';
import Badge from "@material-ui/core/Badge";
import { connect } from "react-redux";
import {watchUpdateShowsNumber} from "../actions/watchUpdateShowsNumber";

const mapStateToProps = state => {
    return {
        updatedShowsNumber: state.updatedShowsNumber
    };
};

const mapDispatchToProps = dispatch => {
    watchUpdateShowsNumber(dispatch);
    return {}
};

class Navigation extends Component {

    render() {

        const { updatedShowsNumber } = this.props;

        return(

            <div>

                {
                    this.props.authUser ?
                        <BottomNavigation className="bottomNav" value={this.props.navigation} style={{width: '100%', position: 'fixed', bottom: '0', left: '0', zIndex: '2'}}>
                            <BottomNavigationAction label="Shows" value="shows" component={Link} to="/shows" icon={<Badge color="primary" badgeContent={updatedShowsNumber} invisible={updatedShowsNumber === 0}><Tv /></Badge>}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
