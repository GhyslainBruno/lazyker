import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../feature/counter/counterSlice'
import alldebridSlice from "../feature/debriders/alldebridSlice";

export default configureStore({
  reducer: {
    counter: counterReducer,
    debriders: alldebridSlice
  },
})
