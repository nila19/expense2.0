import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import _ from 'lodash';

import { axios } from 'app/axios';
import { API } from 'app/config';
import { selectAppGlobal } from 'features/appGlobalSlice';

export const loadAccounts = createAsyncThunk('admin/loadAccounts', async (payload = {}, thunkApi) => {
  const { selectedCity } = selectAppGlobal(thunkApi.getState());
  payload = { ...(payload || {}), cityId: payload.cityId || selectedCity };
  const { data } = await axios().post(API.ACCOUNT.FIND_ALL, payload);
  return data.data;
});

export const modifyAccount = createAsyncThunk('admin/modifyAccount', async (payload) => {
  await axios().post(API.ACCOUNT.MODIFY, payload, { snackbar: 'Account modification' });
});

const replaceIfPresent = (list, item) => {
  const index = list ? _.findIndex(list, { id: item.id }) : -1;
  if (index >= 0) {
    list[index] = item;
  }
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState: {
    loading: false,
    data: [], // data for Dashboard page
  },
  reducers: {
    createAccount: (state, action) => {
      state.data.push(action.payload);
    },
    updateAccount: (state, action) => {
      replaceIfPresent(state.data, action.payload);
    },
  },
  extraReducers: {
    [loadAccounts.pending]: (state, action) => {
      state.loading = true;
    },
    [loadAccounts.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.loading = false;
    },
    [loadAccounts.rejected]: (state, action) => {
      console.log('Search did not get submitted..');
      state.loading = false;
    },
  },
});

export const selectAccounts = (state) => state.admin.accounts;

export const { createAccount, updateAccount } = accountsSlice.actions;
export default accountsSlice.reducer;
