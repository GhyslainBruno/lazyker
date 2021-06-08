import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import Fab from '@material-ui/core/Fab';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import OutlinedInput from '@material-ui/core/OutlinedInput/OutlinedInput';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Close from '@material-ui/icons/CloseOutlined';
import Search from '@material-ui/icons/SearchOutlined';
import React from 'react';
import MovieTorrentsList from '../../movies/infos/MovieTorrentsList';
import {Show, TaggedTorrents, ShowTorrent} from '../../Shows';
import SlideUp from '../../UI-components/SlideUp';
import ShowsTorrentsList from './ShowsTorrentsList';

const styles = {
  outlinedChip : {
    border: 'thin solid grey',
    backgroundColor: 'transparent',
    margin: '5px'
  },
  // Video quality
  multiChipFull: {
    border: 'thin solid #ffe317',
    backgroundColor: '#ffe317',
    opacity: '0.7',
    margin: '2px',
    // color: '#ffe317'
  },
  h264Full: {
    border: 'thin solid #ffa489',
    backgroundColor: '#ffa489',
    opacity: '0.7',
    margin: '2px'
  },
  blurayFull: {
    border: 'thin solid #b4ff56',
    backgroundColor: '#b4ff56',
    opacity: '0.7',
    margin: '2px'
  },
  multiChip: {
    border: 'thin solid #ffe317',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#ffe317'
  },
  hdChip: {
    border: 'thin solid #1bd860',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#1bd860'
  },
  fullHdChip: {
    border: 'thin solid #c7c21d',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#c7c21d'
  },
  aacChip: {
    border: 'thin solid #1ebd97',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#1ebd97'
  },
  dtsChip: {
    border: 'thin solid #ff7858',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#ff7858'
  },
  frenchChip: {
    border: 'thin solid #01dcff',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#01dcff'
  },
  voChip: {
    border: 'thin solid #ac3fff',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#ac3fff'
  },
  h264: {
    border: 'thin solid #ffa489',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#ffa489'
  },
  h265: {
    border: 'thin solid #d55e37',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#d55e37'
  },
  bluray: {
    border: 'thin solid #b4ff56',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#b4ff56'
  },
  vfq: {
    border: 'thin solid #d68bff',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#d68bff'
  },
  hdlight: {
    border: 'thin solid #6bff96',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#6bff96'
  },
  vostfr: {
    border: 'thin solid #5070ff',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#5070ff'
  },
  ac3: {
    border: 'thin solid #32ffa1',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#32ffa1'
  },
  bdrip: {
    border: 'thin solid #a9cb4b',
    backgroundColor: 'transparent',
    opacity: '0.7',
    margin: '2px',
    color: '#a9cb4b'
  },
  uhd: {
    border: 'thin solid #ff631d',
    opacity: '0.7',
    backgroundColor: 'transparent',
    margin: '2px',
    color: '#ff631d'
  },
  vf: {
    border: 'thin solid #2f3dff',
    opacity: '0.7',
    backgroundColor: 'transparent',
    margin: '2px',
    color: '#2f3dff'
  },
  threeD: {
    border: 'thin solid #ac9826',
    opacity: '0.7',
    backgroundColor: 'transparent',
    margin: '2px',
    color: '#ac9826'
  }
};

type ShowsInfoDialogProps = {
  openShowDownloadDialog: boolean;
  closeShowDownloadDialog: () => void;
  showToDownload: Show|null;
  showInfoLoading: boolean;
  seasonNumber: number;
  handlerSeasonNumberChange: (event: any) => void;
  createSeasonsNumbersTable: () => any;
  episodeNumber: number;
  handlerEpisodeNumberChange: (event: any) => void;
  createEpisodesNumbersTable: () => any;
  searchShowEpisodeTorrents: () => void;
  episodeTorrentsLoading: boolean;
  episodeTorrents: TaggedTorrents | null;
  uhd: boolean;
  fullHd: boolean;
  hd: boolean;
  multi: boolean;
  downloadEpisodeTorrent: (torrent: ShowTorrent) => void;
  filterTorrents: (filterValue: string) => void;
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
    uhd,
    fullHd,
    hd,
    multi,
    downloadEpisodeTorrent,
    filterTorrents
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

                  // <div>
                  //   <div style={{textAlign: 'center'}}>
                  //     <Chip label={'4K'} style={uhd ? styles.h264Full : styles.h264} clickable={true} onClick={() => filterTorrents('uhd')}/>
                  //     <Chip label={'1080p'} style={fullHd ? styles.h264Full : styles.h264} clickable={true} onClick={() => filterTorrents('fullHd')}/>
                  //     <Chip label={'720p'} style={hd ? styles.multiChipFull : styles.multiChip} clickable={true} onClick={() => filterTorrents('hd')}/>
                  //     <Chip label={'Multi'} style={multi ? styles.blurayFull : styles.bluray} clickable={true} onClick={() => filterTorrents('multi')}/>
                  //   </div>
                  //
                  //   {/* List of torrents episodes */}
                  //   <List component="nav" dense>
                  //     {episodeTorrents.map((provider: any, index: number) => {
                  //       return (
                  //         <div key={index}>
                  //           <h3 style={{textAlign: 'center'}}>
                  //             {provider.provider}
                  //           </h3>
                  //
                  //           {
                  //             provider.torrents.length !== 0 ?
                  //               provider.torrents.map((torrent: any, index: number) => {
                  //                 return (
                  //                   <Paper elevation={1} style={{margin: '5px', backgroundColor: '#757575'}} key={index}>
                  //
                  //                     <ListItem button
                  //                               style={{overflow: 'hidden'}}>
                  //
                  //
                  //                       <ListItemText
                  //                         style={{padding: '0'}}
                  //                         disableTypography
                  //
                  //                         primary= {
                  //                           <div style={{
                  //                             overflow: 'hidden',
                  //                             textOverflow: 'ellipsis',
                  //                             whiteSpace: 'nowrap'
                  //                           }}>
                  //                             {torrent.title}
                  //                           </div>
                  //                         }
                  //
                  //                         secondary={
                  //
                  //                           <div style={{
                  //                             overflow: 'auto',
                  //                             whiteSpace: 'nowrap'
                  //                           }}
                  //                                className="torrentsChips">
                  //
                  //                             {/* Video quality */}
                  //
                  //                             {
                  //                               torrent.tags.threeD ? <Chip label={'3D'} style={styles.multiChip} /> : null
                  //                             }
                  //
                  //                             {
                  //                               torrent.tags.uhd ? <Chip label={'4k'} style={styles.h264} /> : null
                  //                             }
                  //
                  //                             {
                  //                               torrent.tags.fullHd ? <Chip label={'1080p'} style={styles.h264} /> : null
                  //                             }
                  //
                  //                             {
                  //                               torrent.tags.hd ? <Chip label={'720p'} style={styles.multiChip} /> : null
                  //                             }
                  //
                  //                             {
                  //                               torrent.tags.hdlight ? <Chip label={'hdlight'} style={styles.multiChip} /> : null
                  //                             }
                  //
                  //                             {
                  //                               torrent.tags.bdrip ? <Chip label={'bdrip'} style={styles.multiChip} /> : null
                  //                             }
                  //
                  //                             {
                  //                               torrent.tags.h264 ? <Chip label={'h264'} style={styles.multiChip} /> : null
                  //                             }
                  //
                  //                             {
                  //                               torrent.tags.h265 ? <Chip label={'h265'} style={styles.h264} /> : null
                  //                             }
                  //
                  //
                  //                             {/* Language */}
                  //
                  //                             {
                  //                               torrent.tags.multi ? <Chip label={'multi'} style={styles.bluray} /> : null
                  //                             }
                  //
                  //                             {
                  //                               torrent.tags.vo ?  (torrent.tags.vostfr ? <Chip label={'vostfr'} style={styles.frenchChip} /> : <Chip label={'vo'} style={styles.frenchChip} />) : null
                  //                             }
                  //
                  //                             {
                  //                               torrent.tags.vf ? (torrent.tags.vfq ? <Chip label={'vfq'} style={styles.frenchChip} /> : <Chip label={'vf'} style={styles.frenchChip} />) : null
                  //                             }
                  //
                  //                             {
                  //                               torrent.tags.french ? <Chip label={'french'} style={styles.frenchChip} /> : null
                  //                             }
                  //
                  //                             {/* Audio quality */}
                  //
                  //                             {
                  //                               torrent.tags.aac ? <Chip label={'aac'} style={styles.hdChip} /> : null
                  //                             }
                  //
                  //                             {
                  //                               torrent.tags.dts ? <Chip label={'dts'} style={styles.hdChip} /> : null
                  //                             }
                  //
                  //                           </div>
                  //
                  //                         }
                  //
                  //                         onClick={() => downloadEpisodeTorrent(torrent)}/>
                  //                     </ListItem>
                  //                   </Paper>
                  //                 )})
                  //               :
                  //               <div style={{
                  //                 fontSize: '0.9rem',
                  //                 color: 'grey',
                  //                 textAlign: 'center'
                  //               }}>No torrent found</div>
                  //
                  //           }
                  //         </div>
                  //       )
                  //     })}
                  //   </List>
                  //
                  // </div>

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
