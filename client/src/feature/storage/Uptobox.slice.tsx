import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import firebase from 'firebase';
import ky from 'ky';
import {Dispatch} from 'redux';
import {auth} from '../../firebase';
import {ConnectedStateEnum} from '../ConnectedState.enum';

export const storeToken = createAsyncThunk(
  'uptobox/storeToken',
  async (state, thunkAPI) => {
    try {
      return await ky.get('/api/alldebrid/new_pin').json();
    } catch(error) {
      console.error(error);
    }
  }
)

export const listenTokenState = async (dispatch: Dispatch<any>) => {
  firebase
    .database()
    .ref('/users')
    .child(await auth.getUid())
    .child('/settings/storage/uptobox/token')
    .on('value', (snapshot: any) => {
      console.log(snapshot.val());
      if (snapshot.val() !== null) {
        dispatch(updateConnectedState(ConnectedStateEnum.CONNECTED));
      } else {
        dispatch(updateConnectedState(ConnectedStateEnum.DISCONNECTED));
      }
    })
}

export const saveToken = createAsyncThunk(
  "uptobox/saveToken",
  async (state: any) => {
    await firebase
      .database()
      .ref('/users')
      .child(await auth.getUid())
      .child('/settings/storage/uptobox/token')
      .set(state);
});

export const deleteToken = createAsyncThunk(
  "uptobox/deleteToken",
  async () => {
    await firebase
      .database()
      .ref('/users')
      .child(await auth.getUid())
      .child('/settings/storage/uptobox/token')
      .remove();
  });

export const uptoboxSlice = createSlice({
  name: 'uptobox',
  initialState: {
    token: '',
    loading: false,
    movieFolder: '',
    showsFolder: '',
    connectedState: ConnectedStateEnum.DISCONNECTED,
    isTokenDialogOpened: false
  },
  reducers: {
    updateToken: (state, action) => {
      state.token = action.payload
    },
    openTokenDialog: (state, action) => {
      state.isTokenDialogOpened = action.payload
    },
    updateConnectedState: (state, action) => {
      state.connectedState = action.payload
    }
  },
  extraReducers: {
    [storeToken.fulfilled.type]: (state, action) => {
      state.connectedState = ConnectedStateEnum.CONNECTED;
      state.token = action.payload.token;
    },
    [storeToken.pending.type]: (state, action) => {
      state.connectedState = ConnectedStateEnum.LOADING;
    },
    [storeToken.rejected.type]: (state, action) => {
      state.connectedState = ConnectedStateEnum.DISCONNECTED;
    },

    [saveToken.fulfilled.type]: (state, action) => {
      // state.token = action.payload.token;
      console.log('foo');
    },
    [saveToken.pending.type]: (state, action) => {
      // state.token = action.payload.token;
      console.log('foo');
    },
    [saveToken.rejected.type]: (state, action) => {
      // state.token = action.payload.token;
      console.log('foo');
    },
  }
})

// Action creators are generated for each case reducer function
export const { updateToken, openTokenDialog, updateConnectedState } = uptoboxSlice.actions

export default uptoboxSlice.reducer
