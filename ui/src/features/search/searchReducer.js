import { combineReducers } from '@reduxjs/toolkit';

import searchGlobalReducer from 'features/search/searchGlobalSlice';
import expensesReducer from 'features/search/expenses/expensesSlice';
import expenseEditReducer from 'features/search/expenseEdit/expenseEditSlice';

export default combineReducers({
  searchGlobal: searchGlobalReducer,
  expenses: expensesReducer,
  expenseEdit: expenseEditReducer,
});
