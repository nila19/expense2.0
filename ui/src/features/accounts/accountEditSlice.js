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
      let account = _.cloneDeep(action.payload);
      // account = _.set(account, 'bill.billed', expense.bill && expense.bill.id != null);
      return account;
    },
    resetForm: () => {
      return null;
    },
  },
});

export const selectAccountEdit = (state) => state.accounts.accountEdit;

export const { editAccount, resetForm } = accountEditSlice.actions;
export default accountEditSlice.reducer;
