import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import firebase from 'firebase';
import ky from 'ky';
import {Dispatch} from 'redux';
import {auth} from '../../firebase';
import {ConnectedStateEnum} from '../ConnectedState.enum';
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

export const listenMoviesFolder = async (dispatch: Dispatch<any>) => {
  firebase
    .database()
    .ref('/users')
    .child(await auth.getUid())
    .child('/settings/storage/uptobox/moviesFolder')
    .on('value', (snapshot: any) => {
      if (snapshot.val() !== null) {
        dispatch(updateMoviesState(ConnectedStateEnum.CONNECTED));
        dispatch(updateMoviesFolderPath(snapshot.val()));
      } else {
        dispatch(updateMoviesState(ConnectedStateEnum.DISCONNECTED));
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

    thunkAPI.dispatch(displaySuccessNotification('Token saved'));
});

export const saveMoviesFolder = createAsyncThunk("uptobox/saveMoviesFolder", async (state: any, thunkAPI) => {
  await firebase
    .database()
    .ref('/users')
    .child(await auth.getUid())
    .child('/settings/storage/uptobox/moviesFolder')
    .set(state);

  thunkAPI.dispatch(displaySuccessNotification('Movies folder saved'));
});



export const deleteToken = createAsyncThunk("uptobox/deleteToken", async (state: any, thunkAPI) => {
    await firebase
      .database()
      .ref('/users')
      .child(await auth.getUid())
      .child('/settings/storage/uptobox/token')
      .remove();

  thunkAPI.dispatch(displaySuccessNotification('Token deleted'));
  });

export const deleteMoviesFolder = createAsyncThunk("uptobox/deleteMoviesFolder", async (state: any, thunkAPI) => {
  await firebase
    .database()
    .ref('/users')
    .child(await auth.getUid())
    .child('/settings/storage/uptobox/moviesFolder')
    .remove();

  return thunkAPI.dispatch(displaySuccessNotification('Movies folder deleted'));
});


export const uptoboxSlice = createSlice({
  name: 'uptobox',
  initialState: {
    token: '',
    loading: false,
    moviesFolderPath: '',
    showsFolderPath: '',
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
    updateMoviesFolderPath: (state, action) => {
      state.moviesFolderPath = action.payload
    },
    updateMoviesState: (state, action) => {
      state.moviesState = action.payload;
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

    [saveMoviesFolder.fulfilled.type]: (state, action) => {
      state.isMovieDialogOpened = false;
    },
    [saveMoviesFolder.pending.type]: (state, action) => {
      state.isMovieDialogOpened = true;
    },
    [saveMoviesFolder.rejected.type]: (state, action) => {
      state.isMovieDialogOpened = false;
    },

    [deleteMoviesFolder.fulfilled.type]: (state, action) => {
      state.moviesFolderPath = '';
      state.moviesState = ConnectedStateEnum.DISCONNECTED
    },
    [deleteMoviesFolder.pending.type]: (state, action) => {
    },
    [deleteMoviesFolder.rejected.type]: (state, action) => {
    },

  }
})

// Action creators are generated for each case reducer function
export const {
  updateToken,
  openTokenDialog,
  openDeleteTokenDialog,
  updateConnectedState,
  updateMoviesState,
  updateMoviesFolderPath,
  openMoviesDialog,
  // deleteMoviesFolder
} = uptoboxSlice.actions

export default uptoboxSlice.reducer
