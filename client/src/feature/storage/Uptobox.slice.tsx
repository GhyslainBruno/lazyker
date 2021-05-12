import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import ky from 'ky';
import {auth} from '../../firebase';
import {ConnectedStateEnum} from '../ConnectedState.enum';

export const storeToken = createAsyncThunk(
  'uptobox/storeToken',
  async (state, thunkAPI) => {
    try {
      const response = await ky.get('/api/alldebrid/new_pin').json();
      return response;
    } catch(error) {
      console.error(error);
    }
  }
)

export const uptoboxSlice = createSlice({
  name: 'uptobox',
  initialState: {
    token: null,
    loading: false,
    movieFolder: '',
    showsFolder: '',
    connectedState: ConnectedStateEnum.DISCONNECTED,
    isTokenDialogOpened: false
  },
  reducers: {
    token: (state, action) => {
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
  }
})

// Action creators are generated for each case reducer function
export const { token, openTokenDialog, updateConnectedState } = uptoboxSlice.actions

export default uptoboxSlice.reducer
