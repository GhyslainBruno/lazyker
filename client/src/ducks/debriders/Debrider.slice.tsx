import {createAsyncThunk, createSelector, createSlice} from '@reduxjs/toolkit';
import firebase from 'firebase';
import {auth} from '../../firebase';
import {displaySuccessNotification} from '../snack/Snackbar.slice';
import {DebriderEnum} from '../torrents/debrider.enum';

export const saveDebrider = createAsyncThunk("debriders/saveDebrider", async (state: any, thunkAPI) => {
    await firebase
        .database()
        .ref('/users')
        .child(await auth.getUid())
        .child('/settings/debriders/selected')
        .set(state);

    thunkAPI.dispatch(displaySuccessNotification('Debrider changed'));

    return state;
});

export const fetchDebrider = createAsyncThunk("debriders/fetchDebrider", async () => {
    const snapshot = await firebase
        .database()
        .ref('/users')
        .child(await auth.getUid())
        .child('/settings/debriders/selected')
        .once('value')

    return await snapshot.val();
});

export const debriderSlice = createSlice({
    name: 'debriders',
    initialState: {
        debriderSelected: DebriderEnum.NONE,
    },
    reducers: {
        updateDebrider: (state, action) => {
            state.debriderSelected = action.payload
        },
    },
    extraReducers: {
        [saveDebrider.fulfilled.type]: (state, action) => {
            state.debriderSelected = action.payload;
        },
        [saveDebrider.pending.type]: (state, action) => {
            // state.debriderSelected = DebriderEnum.NONE;
        },
        [saveDebrider.rejected.type]: (state, action) => {
            state.debriderSelected = DebriderEnum.NONE;
        },

        [fetchDebrider.fulfilled.type]: (state, action) => {
            state.debriderSelected = action.payload;
        },
        [fetchDebrider.pending.type]: (state, action) => {
            state.debriderSelected = DebriderEnum.NONE;
        },
        [fetchDebrider.rejected.type]: (state, action) => {
            state.debriderSelected = DebriderEnum.NONE;
        },
    }
})

const getSlice = (state: any) => state.debriders;

export const { updateDebrider } = debriderSlice.actions;

export const getDebriderSelected = createSelector([getSlice], state => state.main.debriderSelected);

export default debriderSlice.reducer;
