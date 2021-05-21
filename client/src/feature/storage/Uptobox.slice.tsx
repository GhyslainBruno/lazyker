import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import firebase from 'firebase';
import ky from 'ky';
import {Dispatch} from 'redux';
import {auth} from '../../firebase';
import {ConnectedStateEnum} from '../ConnectedState.enum';
import {fetchPinCodeStatus} from '../debriders/Alldebrid.slice';
import {displayErrorNotification, displaySuccessNotification} from '../snack/Snackbar.slice';

export const storeToken = createAsyncThunk('uptobox/storeToken', async (state, thunkAPI) => {
    try {
      return await ky.get('/api/alldebrid/new_pin').json();
    } catch(error) {
      console.error(error);
    }
  })

export const listenTokenState = async (dispatch: Dispatch<any>) => {
  firebase
    .database()
    .ref('/users')
    .child(await auth.getUid())
    .child('/settings/storage/uptobox/token')
    .on('value', (snapshot: any) => {
      if (snapshot.val() !== null) {
        dispatch(updateConnectedState(ConnectedStateEnum.CONNECTED));
        dispatch(updateToken(snapshot.val()));
      } else {
        dispatch(updateConnectedState(ConnectedStateEnum.DISCONNECTED));
      }
    })
}

export const saveToken = createAsyncThunk("uptobox/saveToken", async (state: any, thunkAPI) => {
    await firebase
      .database()
      .ref('/users')
      .child(await auth.getUid())
      .child('/settings/storage/uptobox/token')
      .set(state);

    thunkAPI.dispatch(displaySuccessNotification({message: 'Token saved'}));
});

export const deleteToken = createAsyncThunk("uptobox/deleteToken", async (state: any, thunkAPI) => {
    await firebase
      .database()
      .ref('/users')
      .child(await auth.getUid())
      .child('/settings/storage/uptobox/token')
      .remove();

  thunkAPI.dispatch(displaySuccessNotification({message: 'Token deleted'}));
  });

export const fetchFilesList = createAsyncThunk("uptobox/fetchFilesList", async (path: string, thunkAPI) => {
  try {
    return await ky.get(`/api/uptobox/files?path=/${path}`, { headers: {token: await auth.getIdToken()} }).json();
  } catch(error) {
    console.error(error);
    thunkAPI.dispatch(displayErrorNotification({message: error.message}));
    throw error
  }
});

export const uptoboxSlice = createSlice({
  name: 'uptobox',
  initialState: {
    token: '',
    loading: false,
    moviesFolder: '',
    showsFolder: '',
    connectedState: ConnectedStateEnum.DISCONNECTED,
    moviesState: ConnectedStateEnum.DISCONNECTED,
    isTokenDialogOpened: false,
    isMovieDialogOpened: false,
    isDeleteTokenDialogOpened: false,
    displaySnackBar: false,
    snackBarMessage: '',
    areUptoboxMoviesFetching: false,
    uptoboxMovies: {
      currentFolder: '',
      folders: [],
      files: []
    }
  },
  reducers: {
    updateToken: (state, action) => {
      state.token = action.payload
    },
    openTokenDialog: (state, action) => {
      state.isTokenDialogOpened = action.payload
    },
    openDeleteTokenDialog: (state, action) => {
      state.isDeleteTokenDialogOpened = action.payload
    },
    updateConnectedState: (state, action) => {
      state.connectedState = action.payload
    },
    updateMoviesFolder: (state, action) => {
      state.moviesState = action.payload
    },
    updateMoviesState: (state, action) => {
      state.moviesState = action.payload
    },
    openMoviesDialog: (state, action) => {
      state.isMovieDialogOpened = action.payload
    },
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
      state.isTokenDialogOpened = false;
    },
    [saveToken.pending.type]: (state, action) => {
      state.isTokenDialogOpened = true;
    },
    [saveToken.rejected.type]: (state, action) => {
      state.isTokenDialogOpened = false;
    },

    [deleteToken.fulfilled.type]: (state, action) => {
      state.isDeleteTokenDialogOpened = false;
    },
    [deleteToken.pending.type]: (state, action) => {
      state.isDeleteTokenDialogOpened = true;
    },
    [deleteToken.rejected.type]: (state, action) => {
      state.isDeleteTokenDialogOpened = false;
    },

    [fetchFilesList.fulfilled.type]: (state, action) => {
      state.areUptoboxMoviesFetching = false;
      state.uptoboxMovies = action.payload;
    },
    [fetchFilesList.pending.type]: (state, action) => {
      state.areUptoboxMoviesFetching = true;
    },
    [fetchFilesList.rejected.type]: (state, action) => {
      state.areUptoboxMoviesFetching = false;
    },
  }
})

// Action creators are generated for each case reducer function
export const { updateToken, openTokenDialog, openDeleteTokenDialog, updateConnectedState, updateMoviesState, updateMoviesFolder, openMoviesDialog } = uptoboxSlice.actions

export default uptoboxSlice.reducer
