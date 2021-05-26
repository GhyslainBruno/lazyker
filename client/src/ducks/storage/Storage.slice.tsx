import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import firebase from 'firebase';
import {auth} from '../../firebase';
import {displaySuccessNotification} from '../snack/Snackbar.slice';
import {StorageEnum} from './Storage.enum';

export const saveStorage = createAsyncThunk("storage/saveStorage", async (state: any, thunkAPI) => {
  await firebase
    .database()
    .ref('/users')
    .child(await auth.getUid())
    .child('/settings/storage/selected')
    .set(state);

  thunkAPI.dispatch(displaySuccessNotification({message: 'Storage changed'}));

  return state;
});

export const fetchStorage = createAsyncThunk("storage/fetchStorage", async () => {
  const snapshot = await firebase
    .database()
    .ref('/users')
    .child(await auth.getUid())
    .child('/settings/storage/selected')
    .once('value')

  return await snapshot.val();
});

export const storageSlice = createSlice({
  name: 'storage',
  initialState: {
    storageSelected: StorageEnum.NONE,
  },
  reducers: {
    updateStorage: (state, action) => {
      state.storageSelected = action.payload
    },
  },
  extraReducers: {
    [saveStorage.fulfilled.type]: (state, action) => {
      state.storageSelected = action.payload;
    },
    [saveStorage.pending.type]: (state, action) => {
      // state.storageSelected = StorageEnum.NONE;
    },
    [saveStorage.rejected.type]: (state, action) => {
      state.storageSelected = StorageEnum.NONE;
    },

    [fetchStorage.fulfilled.type]: (state, action) => {
      state.storageSelected = action.payload;
    },
    [fetchStorage.pending.type]: (state, action) => {
      state.storageSelected = StorageEnum.NONE;
    },
    [fetchStorage.rejected.type]: (state, action) => {
      state.storageSelected = StorageEnum.NONE;
    },
  }
})

export const { updateStorage } = storageSlice.actions

export default storageSlice.reducer