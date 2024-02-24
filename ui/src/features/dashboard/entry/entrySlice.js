import { createAsyncThunk } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { axios } from 'app/axios';
import { API } from 'app/config';
import { selectAppGlobal } from 'features/appGlobalSlice';

export const addExpense = createAsyncThunk('expenseEntry/addExpense', async (payload, thunkApi) => {
  const { selectedCity } = selectAppGlobal(thunkApi.getState());
  await axios().post(API.EXPENSE.ADD, { cityId: selectedCity, ...payload }, { snackbar: 'Expense entry' });
});

const entrySlice = createSlice({
  name: 'entry',
  initialState: {
    accounts: { from: { id: null }, to: { id: null } },
    category: { id: null },
    description: null,
    amount: null,
    transDt: null,
    adhoc: null,
    recurring: null,
  },
  reducers: {
    setFrom: (state, action) => {
      state.accounts.from.id = action.payload.value;
    },
    setTo: (state, action) => {
      state.accounts.to.id = action.payload.value;
    },
    setCategory: (state, action) => {
      state.category.id = action.payload.value;
    },
    setDesc: (state, action) => {
      state.description = action.payload.value;
    },
    setAmount: (state, action) => {
      state.amount = action.payload.value;
    },
    setTransDt: (state, action) => {
      state.transDt = action.payload.value;
    },
    setAdhoc: (state, action) => {
      state.adhoc = action.payload.value;
    },
    setRecurring: (state, action) => {
      state.recurring = action.payload.value;
    },
    resetEntry: (state) => {
      state.description = null;
      state.amount = null;
    },
  },
});

export const selectEntry = (state) => state.dashboard.entry;

export const { setFrom, setTo, setCategory, setDesc, setAmount, setTransDt, setAdhoc, setRecurring, resetEntry } =
  entrySlice.actions;
export default entrySlice.reducer;
