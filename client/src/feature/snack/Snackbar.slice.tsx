import {createSlice} from '@reduxjs/toolkit';

export const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState: {
    opened: false,
    message: ''
  },
  reducers: {
    displayMessage: (state, action) => {
      state.opened = true;
      state.message = action.payload.message;
    },
    closeSnackBar: (state, action) => {
      state.opened = false;
    }
  },
})

// Action creators are generated for each case reducer function
export const { displayMessage, closeSnackBar } = snackbarSlice.actions

export default snackbarSlice.reducer
