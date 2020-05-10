import { combineReducers } from '@reduxjs/toolkit';

import dashboardGlobalReducer from 'features/dashboard/dashboardGlobalSlice';
import accountsReducer from 'features/dashboard/accounts/accountSlice';
import billsReducer from 'features/dashboard/bills/billReducer';
import chartReducer from 'features/dashboard/chart/chartSlice';

export default combineReducers({
  dashboardGlobal: dashboardGlobalReducer,
  accounts: accountsReducer,
  bills: billsReducer,
  chart: chartReducer,
});
