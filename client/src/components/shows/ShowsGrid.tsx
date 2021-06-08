import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import AddCircle from '@material-ui/icons/AddCircleOutlined';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Delete from '@material-ui/icons/DeleteOutlined';
import Language from '@material-ui/icons/LanguageOutlined';
import SyncDisabled from '@material-ui/icons/SyncDisabledOutlined';
import Sync from '@material-ui/icons/SyncOutlined';
import React from 'react';
import {Show} from '../Shows';

type ShowsGridProps = {
  shows: Show[];
  handleOpenShowDownloadDialog: (shows: Show) => void;
  isInSearchView: boolean;
  showAddShowDialog: (show: Show) => void;
  updateShow: (show: Show) => void;
  showRemoveShowDialog: (show: Show) => void;
  showTvShowInfoDialog: (show: Show) => void;
  loading: boolean;
}

const ShowsGrid = (props: ShowsGridProps) => {

  const {
    shows,
    handleOpenShowDownloadDialog,
    isInSearchView,
    showAddShowDialog,
    updateShow,
    showRemoveShowDialog,
    showTvShowInfoDialog,
    loading
  } = props;

  return (
    <Grid container spacing={0} style={{marginTop: '10px'}}>

      { Object.keys(shows).length > 0 ?

        shows.map((show, index) => {

          return (

            <Grid item xs={4} style={{padding: '6px'}} key={index}>
              <Card>
                <CardMedia
                  style={{paddingTop: '150%', position: 'relative'}}
                  image={"https://image.tmdb.org/t/p/w500" + show.posterPath}
                  title={show.title}
                  onClick={() => handleOpenShowDownloadDialog(show)}
                >
                  <Badge
                    style={show.episode ? {position: 'absolute', top: '0', right: '0', marginRight: '10%', marginTop: '10%'} : {display: 'none'}}
                    children={<CheckCircle style={{fontSize: '20', color: '#f44336'}}/>}
                  />
                </CardMedia>

                {isInSearchView ?

                  <CardActions style={{display: 'flex'}} disableSpacing>
                    <Button aria-label="add" style={{width: '100%'}} onClick={() => showAddShowDialog(show)}>
                      <AddCircle />
                    </Button>
                  </CardActions>

                  :

                  <CardActions style={{display: 'flex'}} disableSpacing>

                    <Button onClick={() => updateShow(show)} style={{minWidth: '0', flex: '1'}}>

                      {show.autoUpdate ?
                        <Sync style={{fontSize: '20'}}/>
                        :
                        <SyncDisabled style={{fontSize: '20'}}/>
                      }
                    </Button>

                    <Button onClick={() => showRemoveShowDialog(show)} style={{minWidth: '0', flex: '1'}}>
                      <Delete style={{fontSize: '20'}}/>
                    </Button>

                    <Button onClick={() => showTvShowInfoDialog(show)} style={{minWidth: '0', flex: '1'}}>
                      <Language />
                    </Button>

                  </CardActions>
                }

              </Card>
            </Grid>

          )

        })

        :

        <div style={loading ? {display: 'none'} : {display: 'inline-block', padding: '30px', color: 'grey', marginRight: 'auto', marginLeft: 'auto'}}>no shows in database</div>

      }

    </Grid>
  )
}

export default ShowsGrid;
