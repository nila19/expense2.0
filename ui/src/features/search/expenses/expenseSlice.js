import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import _ from 'lodash';

import { axios } from 'app/axios';
import { API } from 'app/config';
import { selectAppGlobal } from 'features/appGlobalSlice';

export const loadExpenses = createAsyncThunk('expenses/loadExpenses', async (payload = {}, thunkApi) => {
  const { selectedCity } = selectAppGlobal(thunkApi.getState());
  payload = { ...(payload || {}), cityId: payload.cityId || selectedCity };
  const { data } = await axios().post(API.EXPENSE.SEARCH, payload);
  return data.data;
});

export const deleteExpense = createAsyncThunk('expenses/deleteExpense', async (expenseId) => {
  await axios().post(API.EXPENSE.DELETE, { id: expenseId }, { snackbar: 'Expense delete' });
});

export const swapExpenses = createAsyncThunk('expenses/swapExpenses', async (payload, thunkApi) => {
  const { selectedCity } = selectAppGlobal(thunkApi.getState());
  await axios().post(API.EXPENSE.SWAP, { cityId: selectedCity, ...payload }, { snackbar: 'Expense move' });
});

const expenseSlice = createSlice({
  name: 'expenses',
  initialState: {
    loading: false,
    data: [],
  },
  reducers: {
    createExpense: (state, action) => {
      state.data.push(action.payload);
    },
    updateExpense: (state, action) => {
      const index = _.findIndex(state.data, { id: action.payload.id });
      if (index >= 0) {
        state.data[index] = action.payload;
      }
    },
    dropExpense: (state, action) => {
      _.remove(state.data, (e) => e.id === action.payload.id);
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
  },
});

export const selectExpenses = (state) => state.search.expenses;

export const { createExpense, updateExpense, dropExpense } = expenseSlice.actions;
export default expenseSlice.reducer;
