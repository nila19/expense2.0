import { createAsyncThunk } from '@reduxjs/toolkit';

import axios from 'app/axios';
import { API } from 'app/config';
import { selectAppGlobal } from 'features/appGlobalSlice';

export const addExpense = createAsyncThunk('expenseEntry/addExpense', async (payload, thunkApi) => {
  const { selectedCity } = selectAppGlobal(thunkApi.getState());
  await axios().post(API.EXPENSE.ADD, { cityId: selectedCity, ...payload }, { snackbar: 'Expense entry' });
});
