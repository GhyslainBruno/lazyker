import {createSlice} from '@reduxjs/toolkit';
import {SeverityEnum} from './Severity.enum';

export const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState: {
    opened: false,
    message: '',
    severity: SeverityEnum.NONE
  },
  reducers: {
    displaySuccessNotification: (state, action) => {
      state.opened = true;
      // TODO: make severity using an enum
      state.severity = SeverityEnum.SUCCESS;
      state.message = action.payload.message;
    },
    displayErrorNotification: (state, action) => {
      state.opened = true;
      state.severity = SeverityEnum.ERROR;
      state.message = action.payload.message;
    },
    closeSnackBar: (state, action) => {
      state.opened = false;
    }
  },
})

// Action creators are generated for each case reducer function
export const { displaySuccessNotification, closeSnackBar, displayErrorNotification } = snackbarSlice.actions

export default snackbarSlice.reducer
