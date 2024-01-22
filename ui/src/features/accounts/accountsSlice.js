import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import _ from 'lodash';

import { axios } from 'app/axios';
import { API } from 'app/config';
import { selectAppGlobal } from 'features/appGlobalSlice';

export const loadAccounts = createAsyncThunk('accounts/loadAccounts', async (payload = {}, thunkApi) => {
  const { selectedCity } = selectAppGlobal(thunkApi.getState());
  payload = { ...(payload || {}), cityId: payload.cityId || selectedCity };
  const { data } = await axios().post(API.ACCOUNT.FIND_ALL, payload);
  return data.data;
});

export const tallyAccount = createAsyncThunk('accounts/tallyAccount', async (acctId) => {
  await axios().post(API.ACCOUNT.TALLY, { id: acctId }, { snackbar: 'Account tally' });
});

export const addAccount = createAsyncThunk('accounts/addAccount', async (payload, thunkApi) => {
  const { selectedCity } = selectAppGlobal(thunkApi.getState());
  await axios().post(API.ACCOUNT.ADD, { cityId: selectedCity, ...payload }, { snackbar: 'Account addition' });
});

export const modifyAccount = createAsyncThunk('accounts/modifyAccount', async (payload) => {
  await axios().post(API.ACCOUNT.MODIFY, payload, { snackbar: 'Account modification' });
});

export const deleteAccount = createAsyncThunk('accounts/deleteAccount', async (accountId, thunkApi) => {
  const { selectedCity } = selectAppGlobal(thunkApi.getState());
  await axios().post(API.ACCOUNT.DELETE, { id: accountId, cityId: selectedCity }, { snackbar: 'Account deletion' });
});

const replaceIfPresent = (list, item) => {
  const index = list ? _.findIndex(list, { id: item.id }) : -1;
  if (index >= 0) {
    list[index] = item;
  }
};

const removeIfPresent = (list, item) => {
  return list.filter((e) => e.id !== item.id);
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState: {
    loading: false,
    allAccounts: [],
    accounts: [],
  },
  reducers: {
    insertAccount: (state, action) => {
      state.allAccounts.push(action.payload);
      state.accounts.push(action.payload);
    },
    updateAccount: (state, action) => {
      replaceIfPresent(state.allAccounts, action.payload);
      replaceIfPresent(state.accounts, action.payload);
    },
    dropAccount: (state, action) => {
      state.allAccounts = removeIfPresent(state.allAccounts, action.payload);
      state.accounts = removeIfPresent(state.accounts, action.payload);
    },
  },
  extraReducers: {
    [loadAccounts.pending]: (state, action) => {
      state.loading = true;
    },
    [loadAccounts.fulfilled]: (state, action) => {
      state.allAccounts = action.payload;
      state.accounts = state.allAccounts.filter((e) => e.active);
      state.loading = false;
    },
    [loadAccounts.rejected]: (state, action) => {
      state.loading = false;
    },
  },
});

export const selectAccounts = (state) => state.accounts.accounts;

export const { insertAccount, updateAccount, dropAccount } = accountsSlice.actions;
export default accountsSlice.reducer;
