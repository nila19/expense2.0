import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import _ from 'lodash';

import { axios } from 'app/axios';
import { API } from 'app/config';
import { selectAppGlobal } from 'features/appGlobalSlice';

const executeFetch = async (payload = {}, thunkApi) => {
  const { selectedCity } = selectAppGlobal(thunkApi.getState());
  payload = { ...(payload || {}), cityId: payload.cityId || selectedCity };
  const { data } = await axios().post(API.SEARCH.SEARCH, payload);
  return data.data;
};

// fired during startup for dashboard page
export const loadExpenses = createAsyncThunk('expenses/loadExpenses', executeFetch);

// fired during search action for search page
export const searchExpenses = createAsyncThunk('expenses/searchExpenses', executeFetch);

export const deleteExpense = createAsyncThunk('expenses/deleteExpense', async (expenseId) => {
  await axios().post(API.EXPENSE.DELETE, { id: expenseId }, { snackbar: 'Expense delete' });
});

export const swapExpenses = createAsyncThunk('expenses/swapExpenses', async (payload, thunkApi) => {
  const { selectedCity } = selectAppGlobal(thunkApi.getState());
  await axios().post(API.EXPENSE.SWAP, { cityId: selectedCity, ...payload }, { snackbar: 'Expense move' });
});

const replaceIfPresent = (list, item) => {
  const index = list ? _.findIndex(list, { id: item.id }) : -1;
  if (index >= 0) {
    list[index] = item;
  }
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState: {
    loading: false,
    data: [], // data for Dashboard page
    searchResults: null, // data for Search page
    summaryFilter: null, // set by Summary page when clicking a month.
  },
  reducers: {
    createExpense: (state, action) => {
      state.data.push(action.payload);
    },
    updateExpense: (state, action) => {
      replaceIfPresent(state.data, action.payload);
      replaceIfPresent(state.searchResults, action.payload);
    },
    dropExpense: (state, action) => {
      _.remove(state.data, (e) => e.id === action.payload.id);
      _.remove(state.searchResults, (e) => e.id === action.payload.id);
    },
    clearSearchResults: (state) => {
      state.searchResults = null;
      state.summaryFilter = null;
    },
    setSummaryFilter: (state, action) => {
      state.summaryFilter = action.payload;
    },
  },
  extraReducers: {
    [loadExpenses.pending]: (state, action) => {
      state.loading = true;
    },
    [loadExpenses.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.loading = false;
    },
    [loadExpenses.rejected]: (state, action) => {
      console.log('Search did not get submitted..');
      state.loading = false;
    },
    [searchExpenses.pending]: (state, action) => {
      state.loading = true;
    },
    [searchExpenses.fulfilled]: (state, action) => {
      state.searchResults = action.payload;
      state.loading = false;
    },
    [searchExpenses.rejected]: (state, action) => {
      console.log('Search did not get submitted..');
      state.loading = false;
    },
  },
});

export const selectExpenses = (state) => state.search.expenses;

export const { createExpense, updateExpense, dropExpense, clearSearchResults, setSummaryFilter } = expenseSlice.actions;
export default expenseSlice.reducer;
