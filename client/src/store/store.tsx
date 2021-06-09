import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../ducks/counter/counterSlice'
import alldebridReducer from '../ducks/debriders/Alldebrid.slice';
import realdebridReducer from '../ducks/debriders/Realdebrid.slice';
import uptoboxReducer from '../ducks/storage/Uptobox.slice';
import storageReducer from '../ducks/storage/Storage.slice';
import snackbarReducer from '../ducks/snack/Snackbar.slice';

export default configureStore({
  reducer: {
    counter: counterReducer,
    debriders: alldebridReducer,
    storage: storageReducer,
    uptobox: uptoboxReducer,
    snack: snackbarReducer,
    realdebrid: realdebridReducer
  },
})
