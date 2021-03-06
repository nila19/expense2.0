import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import _ from 'lodash';

import { axios } from 'app/axios';
import { API } from 'app/config';

export const loadAccounts = createAsyncThunk('accounts/loadAccounts', async (payload) => {
  const { data } = await axios().post(API.STARTUP.ACCOUNTS, payload);
  return data.data;
});

export const tallyAccount = createAsyncThunk('accounts/tallyAccount', async (acctId) => {
  await axios().post(API.ACCOUNT.TALLY, { id: acctId }, { snackbar: 'Account tally' });
});

const accountsSlice = createSlice({
  name: 'accounts',
  initialState: [],
  reducers: {
    updateAccount: (state, action) => {
      const index = _.findIndex(state, { id: action.payload.id });
      if (index >= 0) {
        state[index] = action.payload;
      }
    },
  },
  extraReducers: {
    [loadAccounts.fulfilled]: (state, action) => {
      return action.payload;
    },
  },
});

export const selectAccounts = (state) => state.dashboard.accounts;

export const { updateAccount } = accountsSlice.actions;
export default accountsSlice.reducer;
