import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Search from '@material-ui/icons/Search';
import AddCircle from '@material-ui/icons/AddCircle';
import Remove from '@material-ui/icons/Remove';
import Close from '@material-ui/icons/Close';
import Delete from '@material-ui/icons/Delete';
import Sync from '@material-ui/icons/Sync';
import SyncDisabled from '@material-ui/icons/SyncDisabled';
import ArrowBack from '@material-ui/icons/ArrowBack';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Language from '@material-ui/icons/Language';
import Brightness1 from '@material-ui/icons/Brightness1';
import Modal from '@material-ui/core/Modal';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Input from '@material-ui/core/Input';
import Snackbar from '@material-ui/core/Snackbar';
import Avatar from '@material-ui/core/Avatar';
import green from '@material-ui/core/colors/green';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import Badge from '@material-ui/core/Badge';


import '../App.css';



class Shows extends Component {

  constructor(props)
  {
      super(props);
      this.state = {
          shows: null,
          showTitleToSearch: null,
          navigation: null,
          isInSearchView: null,
          dialogTitle: null,
          dialogMessage: null,
          showDialog: false,
          showInfoDialog: false,
          addOrRemoveString: null,
          showToAdd: null,
          showToRemove: null,
          snack: false,
          snackBarMessage: null,
          loading: false,
          infoShow: null,
          // showLang: null,
          showToDisplayInfo: null

      };

      props.changeNavigation('shows');

  }

  // componentDidUpdate() {
  //   console.log('state is', this.state);
  // }

    searchShow = () => {

      this.setState({isInSearchView: true, loading: true, shows: []});

      const showTitle = document.getElementById('show_title_to_search').value;

      fetch('/api/search_shows?title=' + showTitle)
          .then(response => {
              return response.json()
          })
          .then(data => {
              this.setState({shows: data, loading: false});
          })
          .catch(error => {
              this.setState({snack: true, snackBarMessage: 'Error searching shows', loading: false, isInSearchView: false})
          })

  };

    loadShowsInDb = async () => {
        this.setState({loading: true, shows: [], showTitleToSearch: ''});

        try {

            let response = await fetch('/api/shows');
            response = await response.json();
            this.setState({ shows: response , loading: false, isInSearchView: false});

        } catch(error) {
            this.setState({snack: true, snackBarMessage: 'Error getting shows', loading: false, isInSearchView: false})
        }

    };

    async componentWillMount() {
        await this.loadShowsInDb();
        this.clearNewEpisodesTags();
    }

    clearNewEpisodesTags = () => {
        fetch('/api/clear_new_episodes')
            .then(response => {
                return response.json()
            })
            .then(data => {
                return null
            })
            .catch(error => {
                this.setState({snack: true, snackBarMessage: 'Error clearing new episodes', loading: false, isInSearchView: false})
            })
    };

    updateShowTitleToSearch = (evt) => {
        this.setState({
            showTitleToSearch: evt.target.value
        });
    };

    closeDialog = () => {
        this.setState({showDialog: false})
    };

    closeInfoDialog = () => {
        this.setState({showInfoDialog: false})
    };

    showAddShowDialog = (e, show) => {

        this.setState({
            showDialog: true,
            dialogTitle: 'Add show',
            dialogMessage: 'Do you want to add ' + show.title + ' to your list of shows ?',
            addOrRemoveString: 'Add',
            showToAdd: show
        });

    };

    showRemoveShowDialog = (e, show) => {

        this.setState({
            showDialog: true,
            dialogTitle: 'Remove show',
            dialogMessage: 'Do you want to remove ' + show.title + ' of your list of shows ?',
            addOrRemoveString: 'Remove',
            showToRemove: show
        });

    };

    addShow = async () => {

        this.closeDialog();
        this.setState({loading: true, shows: []});
        const show = this.state.showToAdd;
        // show.autoUpdate = true;

        let response = await fetch('/api/add_show', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                show: show
            })
        });

        response = await response.json();

        this.setState({loading: false});

        this.loadShowsInDb();

    };

    onEnterKeyPressed = (event) => {
        if (event.keyCode || event.which === 13) {
            this.searchShow()
        }
    };

    removeShow = async () => {

        // this.setState({loading: true});

        this.closeDialog();

        const show = this.state.showToRemove;

        let response = await fetch('/api/remove_show', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                show: show
            })
        });

        response = response.json();

        // this.setState({loading: false});

        this.loadShowsInDb();

    };

    updateShow = async (show) => {

        show.autoUpdate = !show.autoUpdate;

        let response = await fetch('/api/update_show', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                show: show
            })
        });

        response = await response.json();

        this.setState({snack: true, snackBarMessage: show.title + ' updated', shows: response})
    };

    clearTitle = () => {
        this.setState({showTitleToSearch: ''})
    };

    showTvShowInfoDialog = (show) => {

        if (!this.state.isInSearchView) {
            this.setState({
                showToDisplayInfo: show,
                showInfoDialog: true,
                showLang: show.lang
            });
        }

    };

    changeShowLang = event => {

        const show = this.state.showToDisplayInfo;


        show.lang = event.target.value;

        fetch('/api/tv_show_info', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                show: show
            })
        }).then(response => {
            response = response.json();

            // this.loadShowsInDb();

            this.setState({snack: true, snackBarMessage: show.title + ' lang updated', showLang: show.lang})
        })


    };

  render() {

        if (this.state.shows != null) {
          return (

          <div className="Foo" style={{textAlign: "center"}}>

              <Snackbar
                  open={this.state.snack}
                  onClose={() => this.setState({snack: false})}
                  autoHideDuration={2000}
                  message={this.state.snackBarMessage}
              />

              <Dialog
                  open={this.state.showDialog}
                  onClose={this.closeDialog}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description">

                  <DialogTitle id="alert-dialog-title">{this.state.dialogTitle}</DialogTitle>

                  <DialogContent>
                      <DialogContentText id="alert-dialog-description">{this.state.dialogMessage}</DialogContentText>
                  </DialogContent>

                  <DialogActions>
                      <Button onClick={this.closeDialog} color="primary">
                          Cancel
                      </Button>
                      <Button onClick={this.state.isInSearchView ? this.addShow : this.removeShow} color="primary" autoFocus>
                          {this.state.addOrRemoveString}
                      </Button>
                  </DialogActions>
              </Dialog>

              <Dialog
                  open={this.state.showInfoDialog}
                  onClose={this.closeInfoDialog}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description">

                  <DialogTitle id="alert-dialog-title">Info</DialogTitle>

                  <DialogContent>

                      <DialogContentText id="alert-dialog-description">Select the language you want for this Tv Show</DialogContentText>

                      <div style={{marginTop: '1em', textAlign: 'center'}}>
                          <FormControl>
                              <InputLabel htmlFor="age-simple">Language</InputLabel>
                              <Select
                                  value={this.state.showLang}
                                  onChange={this.changeShowLang}
                                  inputProps={{
                                      name: 'showLang',
                                      id: 'show-lang',
                                  }}
                              >
                                  <MenuItem value={'vostfr'}>vostfr</MenuItem>
                                  <MenuItem value={'french'}>french</MenuItem>
                                  <MenuItem value={'multi'}>multi</MenuItem>
                              </Select>
                          </FormControl>
                      </div>


                  </DialogContent>

                  <DialogActions>
                      <Button onClick={this.closeInfoDialog} color="primary" autoFocus>
                          ok
                      </Button>
                  </DialogActions>
              </Dialog>


              <div style={{flexGrow: '1'}}>
                  <AppBar
                      position="static"
                      color="default">
                      <Toolbar>
                          <IconButton style={this.state.isInSearchView ? {visibility: 'visible', marginRight: '16px'} : {visibility: 'hidden', marginRight: '16px'}}>
                              <ArrowBack onClick={this.loadShowsInDb}/>
                          </IconButton>

                          <Input
                              id="show_title_to_search"
                              value={this.state.showTitleToSearch}
                              placeholder="TV Show title"
                              onChange={evt => this.updateShowTitleToSearch(evt)}
                              disableUnderline={true}
                              style={{width: '80%'}}
                              onKeyPress={(event) => {this.onEnterKeyPressed(event)}}
                          />

                          <IconButton>
                              {this.state.showTitleToSearch !== null && this.state.showTitleToSearch !== '' ?
                                  <Close onClick={this.clearTitle}/>
                                  :
                                  <Search onClick={this.state.showTitleToSearch !== null && this.state.showTitleToSearch !== '' ? this.searchShow : null}/>
                              }

                          </IconButton>

                      </Toolbar>
                  </AppBar>
              </div>

              <CircularProgress style={this.state.loading ? {display: 'inline-block', marginTop: '40px'} : {display: 'none'}}/>

              <Grid container spacing={0} style={{marginTop: '10px'}}>

                  { this.state.shows !== null ? this.state.shows.length > 0 ?

                      this.state.shows.map(show => {

                      return (

                      <Grid item xs={4} style={{padding: '6px'}}>

                          <Card>

                              {/*<Badge badgeContent={<CheckCircle style={{fontSize: '20'}}/>}/>*/}

                              <CardMedia
                                  style={{paddingTop: '150%', position: 'relative'}}
                                  image={"https://image.tmdb.org/t/p/w500" + show.posterPath}
                                  title={show.title}
                              >
                                  <Badge
                                      style={show.episode ? {position: 'absolute', top: '0', right: '0', marginRight: '10%', marginTop: '10%'} : {display: 'none'}}
                                      badgeContent={<CheckCircle style={{fontSize: '20', color: '#f44336'}}/>}
                                  />
                              </CardMedia>

                              {this.state.isInSearchView ?

                                  <CardActions style={{display: 'flex'}} disableActionSpacing>
                                      <Button aria-label="add" style={{width: '100%'}} onClick={(e) => this.showAddShowDialog(e, show)}>
                                          <AddCircle />
                                      </Button>
                                  </CardActions>

                                  :

                                  <CardActions style={{display: 'flex'}} disableActionSpacing>

                                      <Button onClick={(e) => this.updateShow(show)} style={{minWidth: '0', flex: '1'}}>

                                          {show.autoUpdate ?
                                              <Sync style={{fontSize: '20'}}/>
                                              :
                                              <SyncDisabled style={{fontSize: '20'}}/>
                                          }
                                      </Button>

                                      <Button onClick={(e) => this.showRemoveShowDialog(e, show)} style={{minWidth: '0', flex: '1'}}>
                                          <Delete style={{fontSize: '20'}}/>
                                      </Button>

                                      <Button onClick={() => this.showTvShowInfoDialog(show)} style={{minWidth: '0', flex: '1'}}>

                                          <Language />

                                      </Button>

                                  </CardActions>
                              }

                          </Card>
                      </Grid>

                      )

                  })

                  :



                      <div style={this.state.loading ? {display: 'none'} : {display: 'inline-block', padding: '30px', color: 'grey', marginRight: 'auto', marginLeft: 'auto'}}>no results found</div>

                  :
                      null
                  }

              </Grid>

          </div>
        );
        } else {
          return null
        }

      }
}


export default Shows
