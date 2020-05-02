import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import _ from 'lodash';

import axios from 'app/axios';
import { API } from 'app/config';

export const saveEditExpense = createAsyncThunk('expenseEdit/saveEditExpense', async (payload, thunkApi) => {
  await axios().post(API.EXPENSE.MODIFY, payload, { snackbar: 'Expense edit' });
  thunkApi.dispatch(resetForm());
});

const expenseEditSlice = createSlice({
  name: 'expenseEdit',
  initialState: {},
  reducers: {
    editExpense: (state, action) => {
      let expense = _.cloneDeep(action.payload);
      expense = _.set(expense, 'category.adjust', expense.adjust);
      expense = _.set(expense, 'bill.billed', expense.bill && expense.bill.id != null);
      return expense;
    },
    resetForm: () => {
      return null;
    },
  },
});

export const selectExpenseEdit = (state) => state.search.expenseEdit;

export const { editExpense, resetForm } = expenseEditSlice.actions;
export default expenseEditSlice.reducer;
