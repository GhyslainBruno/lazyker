import {createAsyncThunk, createSelector, createSlice} from '@reduxjs/toolkit';
import firebase from 'firebase/app';
import 'firebase/database';
import {Dispatch} from 'redux';
import {auth} from '../../firebase';
import {ConnectedStateEnum} from '../ConnectedState.enum';
import {displaySuccessNotification} from '../snack/Snackbar.slice';

export const listenRealdebridIsConnectedState = async (dispatch: Dispatch<any>, getState: any) => {
    firebase
        .database()
        .ref('/users')
        .child(await auth.getUid())
        .child('settings')
        .child('debriders')
        .child('realdebrid')
        .child('token')
        .on('value', (snapshot: any) => {
            if (snapshot.val() !== null) {
                dispatch(updateRealdebridConnectedState(ConnectedStateEnum.CONNECTED));
            } else {
                dispatch(updateRealdebridConnectedState(ConnectedStateEnum.DISCONNECTED));
            }
        })
}

export const disconnectRealdebrid = createAsyncThunk("realdebrid/disconnect", async (state: any, thunkAPI) => {
    await firebase
        .database()
        .ref('/users')
        .child(await auth.getUid())
        .child('settings')
        .child('debriders')
        .child('realdebrid')
        .child('token')
        .remove();

    thunkAPI.dispatch(displaySuccessNotification('Disconnected'));
});

export const realdebridSlice = createSlice({
    name: 'realdebrid',
    initialState: {
        connectedState: ConnectedStateEnum.DISCONNECTED
    },
    reducers: {
        updateRealdebridConnectedState: (state, action) => {
            state.connectedState = action.payload
        },
    },
    extraReducers: {
        [disconnectRealdebrid.fulfilled.type]: (state, action) => {
            state.connectedState = ConnectedStateEnum.DISCONNECTED;
        },
        [disconnectRealdebrid.pending.type]: (state, action) => {
            state.connectedState = ConnectedStateEnum.CONNECTED;
        },
        [disconnectRealdebrid.rejected.type]: (state, action) => {
            state.connectedState = ConnectedStateEnum.CONNECTED;
        },
    }
})

/**
 * Accessors
 */
const getSlice = (state: any) => state.storage;

// Why when using "createSelector" the component seems not be re rendered when data changes in redux state ?
// --> created selector unusable for now
export const getRealdebridConnectedState = createSelector([getSlice], state => state.connectedState);

export const { updateRealdebridConnectedState } = realdebridSlice.actions;

export default realdebridSlice.reducer;
