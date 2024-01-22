import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import _ from 'lodash';

import { axios } from 'app/axios';
import { API } from 'app/config';

export const saveEditAccount = createAsyncThunk('accountEdit/saveEditAccount', async (payload, thunkApi) => {
  await axios().post(API.ACCOUNT.MODIFY, payload, { snackbar: 'Account edit' });
  thunkApi.dispatch(resetForm());
});

const accountEditSlice = createSlice({
  name: 'accountEdit',
  initialState: {},
  reducers: {
    editAccount: (state, action) => {
      return _.cloneDeep(action.payload);
    },
    resetForm: () => {
      return null;
    },
  },
});

export const selectAccountEdit = (state) => state.accounts.accountEdit;

export const { editAccount, resetForm } = accountEditSlice.actions;
export default accountEditSlice.reducer;
