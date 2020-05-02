import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import _ from 'lodash';

import axios from 'app/axios';
import { API } from 'app/config';

export const loadAccounts = createAsyncThunk('accounts/loadAccounts', async (cityId) => {
  const { data } = await axios().get(API.STARTUP.ACCOUNTS + cityId);
  return data.data;
});

export const tallyAccount = createAsyncThunk('accounts/tallyAccount', async (acctId) => {
  await axios().post(API.ACCOUNT.TALLY, { id: acctId }, { snackbar: 'Account tally' });
});

export const billAccount = createAsyncThunk('accounts/billAccount', async (acctId) => {
  await axios().post(API.ACCOUNT.BILL, { id: acctId }, { snackbar: 'Account bill generation' });
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
