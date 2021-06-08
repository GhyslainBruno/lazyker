import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import Fab from '@material-ui/core/Fab';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput/OutlinedInput';
import Select from '@material-ui/core/Select';
import Close from '@material-ui/icons/CloseOutlined';
import Search from '@material-ui/icons/SearchOutlined';
import React, {useEffect} from 'react';
import {Show, TaggedTorrents, ShowTorrent} from '../../Shows';
import SlideUp from '../../UI-components/SlideUp';
import ShowsTorrentsList from './ShowsTorrentsList';

type ShowsInfoDialogProps = {
  openShowDownloadDialog: boolean;
  closeShowDownloadDialog: () => void;
  showToDownload: Show|null;
  showInfoLoading: boolean;
  seasonNumber: string;
  episodeNumber: string;
  handlerSeasonNumberChange: (event: any) => void;
  createSeasonsNumbersTable: () => any;
  handlerEpisodeNumberChange: (event: any) => void;
  createEpisodesNumbersTable: () => any;
  searchShowEpisodeTorrents: () => void;
  episodeTorrentsLoading: boolean;
  episodeTorrents: TaggedTorrents | null;
  downloadEpisodeTorrent: (torrent: ShowTorrent) => void;
}

const ShowsInfoDialog = (props: ShowsInfoDialogProps) => {

  const {
    openShowDownloadDialog,
    closeShowDownloadDialog,
    showToDownload,
    showInfoLoading,
    seasonNumber,
    handlerSeasonNumberChange,
    createSeasonsNumbersTable,
    episodeNumber,
    handlerEpisodeNumberChange,
    createEpisodesNumbersTable,
    searchShowEpisodeTorrents,
    episodeTorrentsLoading,
    episodeTorrents,
    downloadEpisodeTorrent,
  } = props;

  return (
    <Dialog
      fullScreen
      open={openShowDownloadDialog}
      TransitionComponent={SlideUp}
    >

      <Fab
        onClick={closeShowDownloadDialog}
        size={'small'}
        // @ts-ignore
        style={{margin: '5px', position: 'fixed', zIndex: '2', backgroundColor: '#757575', color: "white", right: '0'}}>
        <Close />
      </Fab>

      <div className="movieInfoDialog">

        <h1 style={{textAlign: 'center'}}>{showToDownload ? showToDownload.title : null}</h1>

        {
          showInfoLoading ?

            <div style={{textAlign: 'center'}}>
              <CircularProgress style={showInfoLoading ? {display: 'inline-block', marginTop: '40px'} : {display: 'none'}}/>
            </div>

            :

            <div>
              <Grid container spacing={0}>

                <Grid item xs={12} style={{padding: '6px', color: 'white', textAlign: 'center'}}>
                  Select the episode wanted
                </Grid>

                <Grid item xs={6} style={{padding: '6px', textAlign: 'center'}}>
                  <FormControl style={{minWidth: '80px'}} variant="outlined">
                    <Select
                      value={seasonNumber}
                      onChange={handlerSeasonNumberChange}
                      input={
                        <OutlinedInput
                          name="seasonNumber"
                          id="season-number"
                        />
                      }>

                      {
                        createSeasonsNumbersTable()
                      }

                    </Select>
                    <FormHelperText>Season number</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={6} style={{padding: '6px', textAlign: 'center'}}>
                  <FormControl style={{minWidth: '80px'}} variant="outlined">
                    <Select
                      value={episodeNumber}
                      onChange={handlerEpisodeNumberChange}
                      input={
                        <OutlinedInput
                          name="episodeNumber"
                          id="episode-number"
                        />
                      }>

                      {
                        createEpisodesNumbersTable()
                      }

                    </Select>
                    <FormHelperText>Episode number</FormHelperText>
                  </FormControl>
                </Grid>

              </Grid>

              <div style={{width: '100%', textAlign: 'center'}}>
                <IconButton onClick={() => searchShowEpisodeTorrents()}>
                  <Search />
                </IconButton>
              </div>

              <div style={{textAlign: 'center'}}>
                <CircularProgress style={episodeTorrentsLoading ? {display: 'inline-block', marginTop: '40px'} : {display: 'none'}}/>
              </div>


              {
                episodeTorrents !== null ?
                  <ShowsTorrentsList
                    torrents={episodeTorrents}
                    downloadTorrent={downloadEpisodeTorrent}
                  />
                  :
                  null
              }
            </div>

        }


      </div>
    </Dialog>
  )
}

export default  ShowsInfoDialog;
