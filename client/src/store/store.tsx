import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../feature/counter/counterSlice'
import alldebridReducer from '../feature/debriders/alldebridSlice';

export default configureStore({
  reducer: {
    counter: counterReducer,
    debriders: alldebridReducer
  },
})
