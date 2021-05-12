import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../feature/counter/counterSlice'
import alldebridReducer from '../feature/debriders/Alldebrid.slice';
import uptoboxReducer from '../feature/storage/Uptobox.slice';

export default configureStore({
  reducer: {
    counter: counterReducer,
    debriders: alldebridReducer,
    storage: uptoboxReducer
  },
})
