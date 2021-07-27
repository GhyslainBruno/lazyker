import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import ky from 'ky';
import {DebriderTorrentDto} from '../../components/downloads/Torrents';
import {auth} from '../../firebase';
import {Database} from '../../firebase/Database';

type FetchDebriderTorrentsDto = {

}

export const fetchDebriderTorrents = createAsyncThunk(
    'debrider/fetchDebriderTorrents',
    async (): Promise<DebriderTorrentDto[]> => {
        const selectedDebrider = await Database.getSelectedDebrider();
        return await ky.get(`/api/debrider/torrents?selectedDebrider=${selectedDebrider}`, {headers: {token: await auth.getIdToken()}}).json();
    }
)

export const torrentsSlice = createSlice({
    name: 'torrents',
    initialState: {
        torrents: [],
        loading: false,
    },
    reducers: {
        isConnected: (state, action) => {

        },
    },
    extraReducers: {
        [fetchDebriderTorrents.fulfilled.type]: (state, action) => {
            state.torrents = action.payload;
            state.loading = false;
        },
        [fetchDebriderTorrents.pending.type]: (state, action) => {
            state.torrents = [];
            state.loading = true;
        },
        [fetchDebriderTorrents.rejected.type]: (state, action) => {
            state.torrents = [];
            state.loading = false;
        },
    }
})

// Action creators are generated for each case reducer function
export const { isConnected } = torrentsSlice.actions

export default torrentsSlice.reducer
