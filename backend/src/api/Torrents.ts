import {Database} from '../database/database';
import {DebriderEnum} from '../database/debrider-enum';
import {Debrider} from '../debriders/debrider';
import * as realdebrid from '../debriders/realdebrid/debrid_links';
import * as admin from 'firebase-admin';
import {DownloadTorrentDto} from '../dtos/download-torrent-dto';
import {MediaInfos} from '../entities/media-infos';
import {ScrapperTorrentInfos} from '../entities/scrapper-torrent-infos';
import {StorageEnum} from '../entities/storage.enum';
import * as Movies from '../movies/Movies';
import * as downloader from '../downloads/downloader'
import {TorrentProviderEnum} from '../scrappers/ygg/torrent-provider-enum';
import * as TvShows from '../tvshows/TvShows';

const db = admin.database();
const usersRef = db.ref("/users");

module.exports = (app: any) => {

    /**
     * Get list of torrents for a particular title
     */
    app.get('/api/torrents', async (req: any, res: any) => {
        try {
            res.send(await Movies.getTorrentsList(req.query.title));
        } catch(error) {
            res.status(500).send({
                message: error.message
            })
        }
    });

    /**
     * Download a torrent file using page url
     */
    app.post('/api/torrents', async (req: any, res: any) => {
        try {

            const { user } = req;

            // ! User should not be part of "DownloadTorrentDto" type !
            const downloadTorrentDto = req.body as DownloadTorrentDto;
            downloadTorrentDto.user = user;

            // Putting this particular movie into "inProgress" state into firebase database
            // await usersRef.child(user.uid).child('/movies').child(req.body.mediaInfos.movieId).set({title: req.body.mediaInfos.title, state: 'finding_links', id: req.body.mediaInfos.movieId});
            await Movies.downloadTorrentFile(downloadTorrentDto);

            res.send({message: 'ok'});
        } catch(error) {
            res.status(500).send({
                message: error
            })
        }
    });

    /**
     * Download an episode torrent file using page url
     * TODO - Remove all duplicated code in here
     */
    app.post('/api/episode_torrents', async (req: any, res: any) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            // Putting this particular movie into "inProgress" state into firebase database
            await usersRef.child(user.uid).child('/movies').child(req.body.id.replace(/\./g, '').replace(/#/g, '').replace(/\$/g, '').replace(/\[/g, '').replace(/]/g, '')).set({title: req.body.title, state: 'finding_links', id: req.body.id});
            TvShows.downloadEpisodeTorrentFile(req.body.url, req.body.provider, req.body.mediaInfos, req.body.id, user);
            res.send({message: 'ok'});
        } catch(error) {
            res.status(500).send({
                message: error
            })
        }
    });

    /**
     * Get a list of torrents from debrider service chose by user
     */
    app.get('/api/debrider/torrents', async (req: any, res: any) => {
        try {
            const { user } = req;
            const torrents = await Debrider.getTorrents(user);
            res.send(torrents);
        } catch(error) {
            res.status(500).send({ message: error })
        }
    });

    /**
     * Download the file into the user's library (precedently torrented in debrider's pool)
     */
    app.post('/api/realdebrid_torrent_download', async (req: any, res: any) => {
        try {
            // const user = await admin.auth().verifyIdToken(req.headers.token);
            const { user } = req;

            await downloader.startRealdebridTorrentDownload(req.body.torrent, req.body.torrent.filename.replace(/\.[^/.]+$/, ""), user, res);
        } catch(error) {

            if (error.message && error.code) {
                res.status(error.code).send({
                    message: error.message
                });
            } else if (error.message) {
                if (error.message === "Cannot read property 'moviesGdriveFolderId' of null") {
                    res.send({
                        message: 'Error : Please select a folder for your Movies - Settings > Configuration'
                    })
                } else if (error.message === "Cannot read property 'tvShowsGdriveFolderId' of null") {
                    res.send({
                        message: 'Error : Please select a folder for your Tv Shows - Settings > Configuration'
                    });
                } else if (error.message === "Cannot read property 'access_token' of null") {
                    res.send({
                        message: 'Error : Please link your Google Drive account - Settings > Configuration > click link icon'
                    });
                } else {
                    res.send({
                        message: error.message
                    });
                }
            }
            else {
                res.send({
                    message: 'Unknown error'
                })
            }
        }
    });

    /**
     * Get streaming links for a particular realdebrid torrent
     */
    app.post('/api/streaming_torrent', async (req: any, res: any) => {
        try {
            const user = await admin.auth().verifyIdToken(req.headers.token);
            const unrestrictedTorrent = await realdebrid.unrestricLinkNoDB(req.body.link, user);

            if (unrestrictedTorrent.streamable === 1) {
                res.send({
                    streamingLink: 'https://real-debrid.com/streaming-' + unrestrictedTorrent.id
                })
            } else {
                res.status(500).send({
                    error: 'File not streamable'
                })
            }

        } catch (error) {
            res.status(500).send({
                message: error
            })
        }
    });

    app.delete('/api/debrider/torrent', async (req: any, res: any) => {
        try {
            const { user } = req;
            const { torrentId } = req.query;

            // Don't know why it was used, keeping it just in case
            // await usersRef.child(user.uid).child(`/torrentsDownloaded/${req.query.torrentId}`).remove();

            const debrider: DebriderEnum = req.query.debrider;

            // await usersRef.child(user.uid).child(`/torrentsDownloaded/${req.query.torrentId}`).remove();
            // await realdebrid.deleteTorrent(req.query.torrentId, user);

            await Debrider.deleteTorrent(user, torrentId, debrider);

            res.send({
                message: 'ok'
            });
        } catch(error) {
            res.status(500).send({
                message: error
            })
        }
    });

};
