import { createSlice } from '@reduxjs/toolkit';
import ky from 'ky';


export const alldebridSlice = createSlice({
  name: 'alldebrid',
  initialState: {
    pinStatus: {
      pin: '',
      check: ''
    },
    loading: false,
    isConnected: false
  },
  reducers: {
    isConnected: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
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
})

// Action creators are generated for each case reducer function
export const { isConnected, pinCodeLoading, pinCodeReceived } = alldebridSlice.actions

// Define a thunk that dispatches those action creators
const fetchPinCode = () => async (dispatch) => {
  dispatch(pinCodeLoading(true))
  const response = await ky.get('/api/alldebrid/new_pin', {json: {foo: true}}).json();
  dispatch(pinCodeReceived(response))
}

export default alldebridSlice.reducer
