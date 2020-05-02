import { combineReducers } from '@reduxjs/toolkit';

import dashboardGlobalReducer from 'features/dashboard/dashboardGlobalSlice';
import accountsReducer from 'features/dashboard/accounts/accountsSlice';
import billsReducer from 'features/dashboard/bills/billsReducer';

export default combineReducers({
  dashboardGlobal: dashboardGlobalReducer,
  accounts: accountsReducer,
  bills: billsReducer,
});
