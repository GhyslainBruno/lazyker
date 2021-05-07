import React, {useEffect, useState} from "react";
import Paper from "@material-ui/core/Paper";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Chip from "@material-ui/core/Chip";
import List from "@material-ui/core/List";

const styles = {
    // Video quality
    multiChip: {
        border: 'thin solid #ffe317',
        backgroundColor: 'transparent',
        opacity: '0.7',
        margin: '2px',
        color: '#ffe317'
    },
    multiChipFull: {
        border: 'thin solid #ffe317',
        backgroundColor: '#ffe317',
        opacity: '0.7',
        margin: '2px',
        // color: '#ffe317'
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
    h264Full: {
        border: 'thin solid #ffa489',
        backgroundColor: '#ffa489',
        opacity: '0.7',
        margin: '2px'
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
    blurayFull: {
        border: 'thin solid #b4ff56',
        backgroundColor: '#b4ff56',
        opacity: '0.7',
        margin: '2px'
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

type MovieTorrentsListProps = {
    providers: any;
    downloadTorrent: (torrent: Torrent) => {};
}

type Torrent = {
    provider: any;
    torrents: [{
        tags: any;
        isDisplayed: any;
        provider: any;
    }]
}

const MovieTorrentsList = (props: MovieTorrentsListProps) => {

    const [uhd, setUhd] = useState(false);
    const [hd, setHd] = useState(false);
    const [fullHd, setFullHd] = useState(false);
    const [multi, setMulti] = useState(false);
    const [torrents, setTorrents] = useState<Torrent[]>(props.providers);
    const [torrentsFiltered, setTorrentsFiltered] = useState(props.providers);

    useEffect(() => {
        filterTorrents();
    }, [uhd, hd, fullHd, multi]);

    const filterTorrents = () => {

        const trueFilter: any[] = [];

        if (uhd) {
            trueFilter.push('uhd');
        }

        if (fullHd) {
            trueFilter.push('fullHd');
        }

        if (hd) {
            trueFilter.push('hd');
        }

        if (multi) {
            trueFilter.push('multi');
        }

        const providersFiltered = torrents.map(torrentsProvider => {

            const localFilteredTorrents = torrentsProvider.torrents.map(torrent => {

                let shouldBeDisplayed = false;

                if (trueFilter.length > 0) {
                    trueFilter.map(filter => {
                        if (Object.keys(torrent.tags).filter((key) => torrent.tags[key]).includes(filter)) {
                            shouldBeDisplayed = true;
                        }
                    });
                } else {
                    shouldBeDisplayed = true;
                }

                torrent.isDisplayed = shouldBeDisplayed;

                if (torrent.isDisplayed) {
                    return torrent;
                }

            });

            return {
                provider: torrentsProvider.provider,
                torrents: localFilteredTorrents.filter(torrent => torrent !== undefined)
            };
        });

        setTorrentsFiltered(providersFiltered);

    };

    return (
        <div className="movieInfoDialog">

            <h2>Torrents</h2>

            <Chip label={'4K'} style={uhd ? styles.h264Full : styles.h264} clickable={true} onClick={() => setUhd(!uhd)}/>
            <Chip label={'1080p'} style={fullHd ? styles.h264Full : styles.h264} clickable={true} onClick={() => setFullHd(!fullHd)}/>
            <Chip label={'720p'} style={hd ? styles.multiChipFull : styles.multiChip} clickable={true} onClick={() => setHd(!hd)}/>
            <Chip label={'Multi'} style={multi ? styles.blurayFull : styles.bluray} clickable={true} onClick={() => setMulti(!multi)}/>

            <List component="nav" dense >

                {
                    torrentsFiltered.map((provider: any) => {
                        return (
                            <div>
                                <h3>
                                    {provider.provider}
                                </h3>

                                {
                                    provider.torrents.length > 0 ?

                                        provider.torrents.map((torrent: any) => {
                                            return (
                                                <Paper elevation={1} style={
                                                    torrent.isDisplayed ?
                                                        {
                                                            margin: '5px',
                                                            backgroundColor: '#757575',
                                                            visibility: 'visible'
                                                        }
                                                        :
                                                        {
                                                            margin: '5px',
                                                            backgroundColor: '#757575',
                                                            visibility: 'hidden'
                                                        }
                                                }>

                                                    <ListItem button
                                                              style={{overflow: 'hidden'}}>


                                                        <ListItemText

                                                            style={{padding: '0'}}

                                                            primary= {
                                                                <div style={{
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                }}>
                                                                    {torrent.title}
                                                                </div>
                                                            }

                                                            secondary={

                                                                <div style={{
                                                                    overflow: 'auto',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                                     className="torrentsChips">

                                                                    {/* Video quality */}

                                                                    {
                                                                        torrent.tags.threeD ? <Chip label={'3D'} style={styles.multiChip} /> : null
                                                                    }

                                                                    {
                                                                        torrent.tags.uhd ? <Chip label={'4k'} style={styles.h264} /> : null
                                                                    }

                                                                    {
                                                                        torrent.tags.fullHd ? <Chip label={'1080p'} style={styles.h264} /> : null
                                                                    }

                                                                    {
                                                                        torrent.tags.hd ? <Chip label={'720p'} style={styles.multiChip} /> : null
                                                                    }

                                                                    {
                                                                        torrent.tags.hdlight ? <Chip label={'hdlight'} style={styles.multiChip} /> : null
                                                                    }

                                                                    {
                                                                        torrent.tags.bdrip ? <Chip label={'bdrip'} style={styles.multiChip} /> : null
                                                                    }

                                                                    {
                                                                        torrent.tags.h264 ? <Chip label={'h264'} style={styles.multiChip} /> : null
                                                                    }

                                                                    {
                                                                        torrent.tags.h265 ? <Chip label={'h265'} style={styles.h264} /> : null
                                                                    }


                                                                    {/* Language */}

                                                                    {
                                                                        torrent.tags.multi ? <Chip label={'multi'} style={styles.bluray} /> : null
                                                                    }

                                                                    {
                                                                        torrent.tags.vo ?  (torrent.tags.vostfr ? <Chip label={'vostfr'} style={styles.frenchChip} /> : <Chip label={'vo'} style={styles.frenchChip} />) : null
                                                                    }

                                                                    {
                                                                        torrent.tags.vf ? (torrent.tags.vfq ? <Chip label={'vfq'} style={styles.frenchChip} /> : <Chip label={'vf'} style={styles.frenchChip} />) : null
                                                                    }

                                                                    {
                                                                        torrent.tags.french ? <Chip label={'french'} style={styles.frenchChip} /> : null
                                                                    }

                                                                    {/* Audio quality */}

                                                                    {
                                                                        torrent.tags.aac ? <Chip label={'aac'} style={styles.hdChip} /> : null
                                                                    }

                                                                    {
                                                                        torrent.tags.dts ? <Chip label={'dts'} style={styles.hdChip} /> : null
                                                                    }

                                                                </div>

                                                            }

                                                            onClick={() => props.downloadTorrent(torrent)}/>
                                                    </ListItem>
                                                </Paper>
                                            )
                                        })
                                        :
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: 'grey'
                                        }}>no torrents found</div>
                                }
                            </div>
                        )
                    })
                }
            </List>
        </div>
    )

};

export default MovieTorrentsList;
