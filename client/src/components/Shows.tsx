import Fab from '@material-ui/core/Fab';
import React, {ChangeEvent, Component, useEffect, useState} from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import FormHelperText from '@material-ui/core/FormHelperText';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Search from '@material-ui/icons/SearchOutlined';
import AddCircle from '@material-ui/icons/AddCircleOutlined';
import Remove from '@material-ui/icons/RemoveOutlined';
import Close from '@material-ui/icons/CloseOutlined';
import Delete from '@material-ui/icons/DeleteOutlined';
import Sync from '@material-ui/icons/SyncOutlined';
import SyncDisabled from '@material-ui/icons/SyncDisabledOutlined';
import ArrowBack from '@material-ui/icons/ArrowBackOutlined';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Language from '@material-ui/icons/LanguageOutlined';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Input from '@material-ui/core/Input';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Badge from '@material-ui/core/Badge';
import Slide from '@material-ui/core/Slide';
import '../App.scss';
import {useDispatch} from 'react-redux';
import {displayErrorNotification, displaySuccessNotification} from '../ducks/snack/Snackbar.slice';
import * as auth from "../firebase/auth";
import Paper from "@material-ui/core/Paper";
import OutlinedInput from "@material-ui/core/OutlinedInput/OutlinedInput";
import Chip from "@material-ui/core/Chip";
import ShowsInfoDialog from './shows/infos/ShowsInfoDialog';
import ShowsAddOrRemoveDialog from './shows/ShowsAddOrRemoveDialog';
import ShowsGrid from './shows/ShowsGrid';
import SlideUp from './UI-components/SlideUp';

// TODO: Should be useful in filter torrent functions
export const getKeyValue = <T extends object, U extends keyof T>(key: U) => (obj: T) => obj[key];

type ShowsProps = {
    changeNavigation: (location: any) => void;
}

export type Show = {
    id: any;
    title: string;
    autoUpdate: boolean;
    lang: any;
    episode: boolean;
    posterPath: string;
}

export type Tags = {
    multi: boolean;
    french: boolean;
    vo: boolean;
    aac: boolean;
    dts: boolean;
    fullHd: boolean;
    hd: boolean;
    h264: boolean;
    h265: boolean;
    vfq: boolean;
    hdlight: boolean;
    vostfr: boolean;
    bdrip: boolean;
    uhd: boolean;
    threeD: boolean;
    vf: boolean;
}

export type ShowTorrent = {
    url: string;
    provider: any;
    title: string;
    // tags: any;
    isDisplayed: boolean;
    completed: string;
    leech: string;
    seed: string;
    size: string;
    tags: Tags
}

type TaggedProviderTorrents = {
    // TODO: change by an enum
    provider: string;
    torrents: ShowTorrent[];
}

export type TaggedTorrents = TaggedProviderTorrents[]

type GetUserShowsDTO = {
    shows: Show[];
    total: number;
}

type ShowInfoDto = {
    show: {
        seasonsEpisodesNumbers: any;
    }
}

type DownloadEpisodeTorrentDto = {
    message: string;
}

type SearchShowEpisodeTorrents = SearchShowEpisodeTorrent[]

type SearchShowEpisodeTorrent = {
    torrents: ShowTorrent[];
}

type ShowsState = {
    shows: any;
    showTitleToSearch: string;
    navigation: any;
    isInSearchView: any;
    dialogTitle: string;
    dialogMessage: string;
    showDialog: boolean;
    showInfoDialog: boolean;
    addOrRemoveString: any;
    showToAdd: Show | null;
    showToRemove: Show | null;
    snack: boolean;
    snackBarMessage: string;
    loading: boolean;
    infoShow: any;
    showToDisplayInfo: any;
    openShowDownloadDialog: boolean;
    showToDownload: Show | null;
    episodeTorrentsLoading: boolean;
    episodeTorrentsFull: any;
    episodeTorrents: any;
    seasonNumber: number;
    episodeNumber: number;
    qualityEpisode: any;
    showInfoLoading: boolean;
    seasonsEpisodesNumbers: any[];
    showLang: any;
    uhd: boolean;
    fullHd: boolean;
    hd: boolean;
    multi: boolean;
}

type SearchShowsDto = {
    shows: Show[];
    total: number;
}

const Shows = (props: ShowsProps, state: ShowsState) => {

    const [showLang, setShowLang] = useState(null);
    const [shows, setShows] = useState<Show[]|null>(null);
    const [showTitleToSearch, setShowTitleToSearch] = useState('');
    const [isInSearchView, setIsInSearchView] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [showInfoDialog, setShowInfoDialog] = useState(false);
    const [addOrRemoveString, setAddOrRemoveString] = useState('');
    const [showToAdd, setShowToAdd] = useState<Show|null>(null);
    const [showToRemove, setShowToRemove] = useState<Show|null>(null);
    const [loading, setLoading] = useState(false);
    const [showToDisplayInfo, setShowToDisplayInfo] = useState<Show|null>(null);
    const [openShowDownloadDialog, setOpenShowDownloadDialog] = useState(false);
    const [showToDownload, setShowToDownload] = useState<Show|null>(null);
    const [episodeTorrentsLoading, setEpisodeTorrentsLoading] = useState(false);
    const [episodeTorrentsFull, setEpisodeTorrentsFull] = useState<TaggedTorrents|null>(null);
    const [episodeTorrents, setEpisodeTorrents] = useState<TaggedTorrents|null>(null);
    const [seasonNumber, setSeasonNumber] = useState('');
    const [episodeNumber, setEpisodeNumber] = useState('');
    const [qualityEpisode, setQualityEpisode] = useState(null);
    const [showInfoLoading, setShowInfoLoading] = useState(false);
    const [seasonsEpisodesNumbers, setSeasonsEpisodesNumbers]= useState<any[]>([]);

    const dispatch = useDispatch();

    useEffect(() => {
        (async function () {
            await loadShowsInDb();
            await clearNewEpisodesTags();
        })()
    }, []);

    // Searching for a new tv show
    const searchShow = async () => {
        setIsInSearchView(true);
        setLoading(true);
        setShows([]);

        // @ts-ignore
        const showTitle = document.getElementById('show_title_to_search')?.value;

        fetch('/api/search_shows?title=' + showTitle, {
            method: 'GET',
            headers: {
                'token': await auth.getIdToken()
            }
        })
          .then(response => {
              return response.json()
          })
          .then((data: SearchShowsDto) => {
              setShows(data.shows);
              setLoading(false);
          })
          .catch(error => {
              dispatch(displayErrorNotification('Error searching shows'));
              setLoading(false);
              setIsInSearchView(false);
          })

    };

    // Loading shows from database
    // TODO: stop using backend for such things, for god' sake !! -> 0 interest
    const loadShowsInDb = async () => {
        setLoading(true);
        setShows([]);
        setShowTitleToSearch('');

        try {

            // TODO: use a proper type for the fetch returns
            const response = await fetch('/api/shows', {
                  method: 'GET',
                  headers: {
                      'token': await auth.getIdToken()
                  }
              }
            );
            const responseJSON: GetUserShowsDTO = await response.json();

            setShows(responseJSON.shows);
            setLoading(false);
            setIsInSearchView(false);

        } catch(error) {
            dispatch(displayErrorNotification('Error getting shows'));
            setLoading(false);
            setIsInSearchView(false);
        }

    };

    const clearNewEpisodesTags = async () => {
        fetch('/api/clear_new_episodes',{
            headers: {
                'token': await auth.getIdToken()
            }
        })
          .then(response => {
              return response.json()
          })
          .then(data => {
              return null
          })
          .catch(error => {
              dispatch(displayErrorNotification('Error clearing new episodes tags'));
              setLoading(false);
              setIsInSearchView(false);
          })
    };

    const updateShowTitleToSearch = (evt: any) => {
        setShowTitleToSearch(evt.target.value);
    };

    const closeDialog = () => {
        setShowDialog(false);
    };

    const closeInfoDialog = () => {
        setShowInfoDialog(false);
    };

    const showAddShowDialog = (show: Show) => {
        setShowDialog(true);
        setDialogTitle('Add show');
        setDialogMessage('Do you want to add ' + show.title + ' to your list of shows ?');
        setAddOrRemoveString('Add');
        setShowToAdd(show);
    };

    const showRemoveShowDialog = (show: Show) => {
        setShowDialog(true);
        setDialogTitle('Remove show');
        setDialogMessage('Do you want to remove ' + show.title + ' of your list of shows ?');
        setAddOrRemoveString('Remove');
        setShowToRemove(show);
    };

    // Adding a new tv show to database
    const addShow = async () => {

        try {

            closeDialog();
            setLoading(true);
            setShows([]);

            const show = showToAdd;

            await fetch('/api/show', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    show: show
                })
            });

            setLoading(false);
            await loadShowsInDb();

        } catch(error) {
            dispatch(displayErrorNotification('Error adding show'));
            setLoading(false);
            setIsInSearchView(false);
        }

    };

    const onEnterKeyPressed = (event: any) => {
        if (event.keyCode || event.which === 13) {

            searchShow();

        }
    };

    // Removing a tv show from database
    const removeShow = async () => {

        closeDialog();

        const show = showToRemove;

        await fetch('/api/show', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'token': await auth.getIdToken()
            },
            body: JSON.stringify({
                show: show
            })
        });

        loadShowsInDb();

    };

    // Changing the "autoUpdate" state of the tv show | TODO add a try/catch block here
    const updateShow = async (show: Show) => {

        show.autoUpdate = !show.autoUpdate;

        await fetch('/api/show', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'token': await auth.getIdToken()
            },
            body: JSON.stringify({
                show: show
            })
        });

        dispatch(displaySuccessNotification(`${show.title} updated`));
    };

    /**
     * Opens the dialog with downloads parts - and fetch episodes numbers
     */
    const handleOpenShowDownloadDialog = async (show: Show) => {

        try {

            setOpenShowDownloadDialog(true);
            setShowToDownload(show);
            setShowInfoLoading(true);

            const response = await fetch('/api/show/' + show.id, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                }
            });

            const showInfo: ShowInfoDto = await response.json();

            setSeasonsEpisodesNumbers(showInfo.show.seasonsEpisodesNumbers);
            setShowInfoLoading(false);
        } catch (error) {
            setShowInfoLoading(false);
            dispatch(displayErrorNotification('Can\'t get show infos'));
        }

    };

    /**
     * Closes the dialog with downloads parts
     * */
    const closeShowDownloadDialog = () => {
        setOpenShowDownloadDialog(false);
        setEpisodeTorrents(null);
        setShowToDownload(null);
        setEpisodeNumber('');
        setSeasonNumber('');
        setEpisodeTorrentsLoading(false);
        setQualityEpisode(null);
    };

    const showTvShowInfoDialog = (show: Show) => {

        if (!isInSearchView) {
            setShowInfoDialog(true);
            setShowToDisplayInfo(show);
            setShowLang(show.lang);
        }

    };

    // Changing the lang of the tv show (vostfr, french, multi)
    const changeShowLang = async (event: ChangeEvent<{ value: unknown }>) => {

        const show = showToDisplayInfo;

        if (show !== null) {
            show.lang = event.target.value;

            try {
                await fetch('/api/show', {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'token': await auth.getIdToken()
                    },
                    body: JSON.stringify({
                        show: show
                    })
                });

                setShowLang(show.lang);
                dispatch(displaySuccessNotification(`${show.title} lang updated`));
            } catch (error) {
                dispatch(displayErrorNotification('Error changing lang'));
                setLoading(false);
                setIsInSearchView(false);
            }
        } else {
            dispatch(displayErrorNotification('Bad show'));
        }

    };

    // Function triggered to fetch tv show episode available torrents
    const searchShowEpisodeTorrents = async () => {

        setEpisodeTorrentsLoading(true);
        setEpisodeTorrents(null);

        try {
            // add  ${qualityEpisode} to use quality
            let searchString = '';

            if (seasonNumber) {
                searchString = `${showToDownload?.title} S${seasonNumber}`;
            } else {
                searchString = `${showToDownload?.title}`;
            }

            if (seasonNumber && episodeNumber) {
                searchString = `${showToDownload?.title} S${seasonNumber}E${episodeNumber}`;
            }

            // let response = await fetch(`/api/torrents?title=${searchString}`, {
            //     method: 'GET'
            // });

            // const torrents: SearchShowEpisodeTorrents = await response.json();

            const torrents = [{
                'provider': 'ygg',
                'torrents': [
                    {
                        tags: {},
                        completed: "64",
                        leech: "0",
                        provider: "ygg",
                        seed: "10",
                        size: "266.95Mo",
                        title: "Avengers Infinity War (2018) MULTi VFQ 1080p BluRay REMUX AVC DTS.GHT (Avengers : La guerre de l'infini) vf 4k ac3",
                        url: "https://www2.yggtorrent.ch/torrent/audio/musique/233399-alan+silvestri+avengers+infinity+war+original+motion+picture+soundtrack+2018web+mp3+320kbps"
                    }, {
                        tags: {},
                        completed: "35",
                        leech: "0",
                        provider: "ygg",
                        seed: "9",
                        size: "592.12Mo",
                        title: "Alan Silvestri – Avengers: Infinity War (Original Motion Picture Soundtrack) (2018)(web.flac.16bit) 720p ",
                        url: "https://www2.yggtorrent.ch/torrent/audio/musique/233400-alan+silvestri+avengers+infinity+war+original+motion+picture+soundtrack+2018web+flac+16bit"
                    }, {
                        tags: {},
                        completed: "747",
                        leech: "1",
                        provider: "ygg",
                        seed: "134",
                        size: "1.73Go",
                        title: "Avengers Infinity War (2018) French AAC BluRay 720p x264.GHT (Avengers:  La guerre de l'infini) vfq ac3 aac vf 1080p 4k uhd ",
                        url: "https://www2.yggtorrent.ch/torrent/film-video/film/295275-avengers+infinity+war+2018+french+aac+bluray+720p+x264+ght+avengers+la+guerre+de+linfini"
                    }
                ] as ShowTorrent[]
            }]

            const torrentsTagged = torrents[0].torrents.map(torrent => {

                // torrent.tags = {};

                torrent.tags.multi = !!torrent.title.match(/multi/mi);
                torrent.tags.french = !!torrent.title.match(/french/mi);
                torrent.tags.vo = !!torrent.title.match(/vo/mi);
                torrent.tags.aac = !!torrent.title.match(/aac|ac3/mi);
                torrent.tags.dts = !!torrent.title.match(/dts/mi);
                torrent.tags.fullHd= !!torrent.title.match(/1080p/mi);
                torrent.tags.hd = !!torrent.title.match(/720p/mi);
                torrent.tags.h264 = !!torrent.title.match(/x264|h264/mi);
                torrent.tags.h265 = !!torrent.title.match(/x265|h265/mi);
                // torrent.bluray = !!torrent.title.match(/bluray/mi);
                torrent.tags.vfq = !!torrent.title.match(/vfq/mi);
                torrent.tags.hdlight = !!torrent.title.match(/hdlight/mi);
                // torrent.ac3 = !!torrent.title.match(/ac3/mi);
                torrent.tags.vostfr = !!torrent.title.match(/stfr/mi);
                torrent.tags.bdrip = !!torrent.title.match(/bdrip/mi);
                torrent.tags.uhd = !!torrent.title.match(/2160p|4k|uhd/mi);
                torrent.tags.threeD = !!torrent.title.match(/3d/mi);
                torrent.tags.vf = !!torrent.title.match(/vf/mi);

                return torrent;
            });

            const torrentsTaggedToReturn: TaggedTorrents = [];

            torrentsTaggedToReturn.push({
                torrents : torrentsTagged,
                provider: 'ygg'
            });

            setEpisodeTorrentsLoading(false);
            setEpisodeTorrents(torrentsTaggedToReturn);
            setEpisodeTorrentsFull(torrentsTaggedToReturn);
        } catch(error) {
            dispatch(displayErrorNotification('Error while getting episode torrents'));
            setEpisodeTorrentsLoading(false);
        }

    };

    // Starts the download of the torrent for this episode of this tv show wanted
    const downloadEpisodeTorrent = async (torrent: ShowTorrent) => {

        setEpisodeTorrentsLoading(true);
        setEpisodeTorrents(null);

        try {
            let response = await fetch('/api/episode_torrents', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': await auth.getIdToken()
                },
                body: JSON.stringify({
                    url: torrent.url,
                    provider: torrent.provider,
                    title: torrent.title,
                    mediaInfos: {
                        lastSeason: seasonNumber,
                        lastEpisode: episodeNumber,
                        name: showToDownload?.title,
                        isShow: true
                    },
                    id: torrent.title,
                })
            });

            const responseDto: DownloadEpisodeTorrentDto = await response.json();

            if (responseDto.message !== 'ok') {
                dispatch(displayErrorNotification('Error while downloading torrent file'))
            } else {
                dispatch(displayErrorNotification('Torrent added - check progress in downloads'))
            }

            setEpisodeTorrentsLoading(false);

            setTimeout(() => {
                closeShowDownloadDialog();
            }, 2000);

        } catch(error) {
            dispatch(displayErrorNotification('Error while downloading torrent file'))
            setEpisodeTorrentsLoading(false);
            closeShowDownloadDialog();
        }
    };

    const handlerSeasonNumberChange = (event: any) => {
        setSeasonNumber(event.target.value);
    };

    const handlerEpisodeNumberChange = (event: any) => {
        setEpisodeNumber(event.target.value);
    };

    const handlerQualityEpisodeChange = (event: any) => {
        // @ts-ignore
        setState({ [event.target.name]: event.target.value });
    };

    const createSeasonsNumbersTable = (): JSX.Element[] | undefined => {
        let table: JSX.Element[] = [];

        // @ts-ignore
        table.push(<MenuItem value={null} key={0}>{""}</MenuItem>);

        if (seasonsEpisodesNumbers.length > 0) {
            const seasonsNumber = seasonsEpisodesNumbers.filter((season: any) => season.season_number === Math.max.apply(Math, seasonsEpisodesNumbers.map(function(o: any) { return o.season_number; })))[0].season_number;

            for (let i = 0; i < seasonsNumber; i++) {

                // TODO: WTF ?
                const number = parseInt(String(i + 1)).toString().padStart(2, '0');

                table. push(<MenuItem value={number} key={i + 1}>{number}</MenuItem>);
            }

            return table
        }

    };

    const createEpisodesNumbersTable = (): JSX.Element[] | undefined => {
        let table = [];

        // @ts-ignore
        table.push(<MenuItem value={null} key={0}>{""}</MenuItem>);

        if (seasonsEpisodesNumbers.length > 0 && seasonNumber !== '') {

            const episodesNumber = seasonsEpisodesNumbers.filter(season => season.season_number === +seasonNumber)[0].episode_count

            for (let i = 0; i < episodesNumber; i++) {

                const number = parseInt(String(i + 1)).toString().padStart(2, '0');


                table.push(<MenuItem value={number} key={i + 1}>{number}</MenuItem>);
            }

            return table
        }

    };

    if (shows != null) {
        return (
          <div className="Foo" style={{textAlign: "center", paddingBottom: '10%'}}>

              {/* Dialog to select and download show episode */}
              <ShowsInfoDialog
                openShowDownloadDialog={openShowDownloadDialog}
                closeShowDownloadDialog={closeShowDownloadDialog}
                showToDownload={showToDownload}
                showInfoLoading={showInfoLoading}
                seasonNumber={seasonNumber}
                handlerSeasonNumberChange={handlerSeasonNumberChange}
                episodeNumber={episodeNumber}
                handlerEpisodeNumberChange={handlerEpisodeNumberChange}
                createSeasonsNumbersTable={createSeasonsNumbersTable}
                createEpisodesNumbersTable={createEpisodesNumbersTable}
                searchShowEpisodeTorrents={searchShowEpisodeTorrents}
                episodeTorrentsLoading={episodeTorrentsLoading}
                episodeTorrents={episodeTorrents}
                downloadEpisodeTorrent={downloadEpisodeTorrent}
                />

              <ShowsAddOrRemoveDialog
                addShow={addShow}
                showToAdd={showToAdd}
                removeShow={removeShow}
                showToRemove={showToRemove}
                isInSearchView={isInSearchView}
                showDialog={showDialog}
                addOrRemoveString={addOrRemoveString}
                closeDialog={closeDialog}
                dialogMessage={dialogMessage}
                dialogTitle={dialogTitle}
              />

              {/* Dialog to change language */}
              <Dialog
                open={showInfoDialog}
                onClose={closeInfoDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">

                  <DialogTitle id="alert-dialog-title">Info</DialogTitle>

                  <DialogContent>

                      <DialogContentText id="alert-dialog-description">Select the language you want for this Tv Show</DialogContentText>

                      <div style={{marginTop: '1em', textAlign: 'center'}}>
                          <FormControl>
                              <InputLabel htmlFor="age-simple">Language</InputLabel>
                              <Select
                                value={showLang}
                                onChange={(event) => changeShowLang(event)}
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
                      <Button onClick={closeInfoDialog} color="primary" autoFocus>
                          ok
                      </Button>
                  </DialogActions>
              </Dialog>

              {/* Shows App Bar */}
              <div style={{flexGrow: 1}}>
                  <AppBar
                    position="static"
                    color="default">
                      <Toolbar>
                          <IconButton
                            onClick={loadShowsInDb}
                            style={isInSearchView ? {visibility: 'visible', marginRight: '16px'} : {visibility: 'hidden', marginRight: '16px'}}
                          >
                              <ArrowBack />
                          </IconButton>

                          <Input
                            id="show_title_to_search"
                            value={showTitleToSearch}
                            placeholder="TV Show title"
                            type="search"
                            onChange={evt => updateShowTitleToSearch(evt)}
                            disableUnderline={true}
                            style={{width: '80%'}}
                            onKeyPress={(event) => {onEnterKeyPressed(event)}}
                          />

                          {showTitleToSearch !== null && showTitleToSearch !== '' ?
                            <IconButton onClick={() => setShowTitleToSearch('')}>
                                <Close />
                            </IconButton>
                            :
                            <IconButton onClick={() => showTitleToSearch !== null && showTitleToSearch !== '' ? searchShow : null}>
                                <Search />
                            </IconButton>
                          }

                      </Toolbar>
                  </AppBar>
              </div>

              <CircularProgress style={loading ? {display: 'inline-block', marginTop: '40px'} : {display: 'none'}}/>

              <ShowsGrid
                shows={shows}
                loading={loading}
                showTvShowInfoDialog={showTvShowInfoDialog}
                handleOpenShowDownloadDialog={handleOpenShowDownloadDialog}
                isInSearchView={isInSearchView}
                showAddShowDialog={showAddShowDialog}
                showRemoveShowDialog={showRemoveShowDialog}
                updateShow={updateShow}
              />

          </div>
        );
    } else {
        return null
    }
}

export default Shows;

