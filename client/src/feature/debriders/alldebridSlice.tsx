import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import ky from 'ky';
import {auth} from '../../firebase';

let pinStatusPoller: any = {};

type NewPinDto = {
  pin: {
    pin: string;
    check: string;
    expires_in: number;
    user_url: string;
    base_url: string;
    check_url: string;
  }
}

export const fetchNewPinCode = createAsyncThunk(
  'alldebrid/fetchNewPinCode',
  async (state, thunkAPI) => {
    try {
      const response: NewPinDto = await ky.get('/api/alldebrid/new_pin').json();
      pinStatusPoller = setInterval(() => thunkAPI.dispatch(fetchPinCodeStatus({pin: response.pin.pin, check: response.pin.check})), 3000)
      return response.pin;
    } catch(error) {
      console.error(error);
    }
  }
)

type FetchPinCodeStatusProps = {
  pin: string;
  check: string;
}

type FetchPinCodeStatusDto = {
  pin_status: {
    activated: boolean;
    expires_in: number;
  }
}

export const fetchPinCodeStatus = createAsyncThunk(
  'alldebrid/fetchPinCodeStatus',
  async (form: FetchPinCodeStatusProps) => {
    try {
      const response: FetchPinCodeStatusDto = await ky.get(`/api/alldebrid/check_pin_status?pin=${form.pin}&check=${form.check}`, { headers: {token: await auth.getIdToken()} }).json();
      return response.pin_status;
    } catch(error) {
      console.error(error);
      throw error;
    }
  }
)


export const alldebridSlice = createSlice({
  name: 'alldebrid',
  initialState: {
    pinStatus: {
      pin: '',
      check: '',
      connectionUrl: '',
      activated: false,
      expiresIn: 0
    },
    loading: false,
    isConnected: 'disconnected'
  },
  reducers: {
    isConnected: (state, action) => {
      state.isConnected = action.payload
    },
    pinCodeLoading: (state, action) => {
      state.loading = action.payload;
    },
    pinCodeReceived: (state, action) => {
      if (state.loading) {
        state.loading = false;
        state.pinStatus = action.payload;
      }
    }
  },
  extraReducers: {
    [fetchNewPinCode.fulfilled.type]: (state, action) => {
      state.pinStatus.pin = action.payload.pin;
      state.pinStatus.check = action.payload.check;
      state.loading = false;
      state.isConnected = 'loading';
      state.pinStatus.connectionUrl = action.payload.user_url;
    },
    [fetchNewPinCode.pending.type]: (state, action) => {
      state.pinStatus.pin = '';
      state.pinStatus.check = '';
      state.loading = true;
    },
    [fetchNewPinCode.rejected.type]: (state, action) => {
      state.pinStatus.pin = '';
      state.pinStatus.check = '';
      state.loading = false;
    },

    [fetchPinCodeStatus.fulfilled.type]: (state, action) => {
      if (action.payload.activated) {
        state.isConnected = 'connected';
        clearInterval(pinStatusPoller);
      }
      state.pinStatus.activated = action.payload.activated;
      state.pinStatus.expiresIn = action.payload.expires_in;
    },
    [fetchPinCodeStatus.pending.type]: (state, action) => {

    },
    [fetchPinCodeStatus.rejected.type]: (state, action) => {

    },
  }
})

// Action creators are generated for each case reducer function
export const { isConnected, pinCodeLoading, pinCodeReceived } = alldebridSlice.actions

export default alldebridSlice.reducer
