import {combineReducers, configureStore} from '@reduxjs/toolkit'
import counterReducer from '../ducks/counter/counterSlice'
import alldebridReducer from '../ducks/debriders/Alldebrid.slice';
import debriderReducer from '../ducks/debriders/Debrider.slice';
import realdebridReducer from '../ducks/debriders/Realdebrid.slice';
import uptoboxReducer from '../ducks/storages/Uptobox.slice';
import storageReducer from '../ducks/storages/Storage.slice';
import snackbarReducer from '../ducks/snack/Snackbar.slice';

const storagesReducer = combineReducers({
  main: storageReducer,
  uptobox: uptoboxReducer
})

const debridersReducer = combineReducers({
  main: debriderReducer,
  alldebrid: alldebridReducer,
  realdebrid: realdebridReducer
})

export default configureStore({
  reducer: {
    counter: counterReducer,
    debriders: debridersReducer,
    storages: storagesReducer,
    snack: snackbarReducer
  },
})
