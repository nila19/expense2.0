import { combineReducers } from '@reduxjs/toolkit';

import dashboardGlobalReducer from 'features/dashboard/dashboardGlobalSlice';
import billsReducer from 'features/dashboard/bills/billReducer';
import chartReducer from 'features/dashboard/chart/chartSlice';
import entryReducer from 'features/dashboard/entry/entrySlice';

export default combineReducers({
  dashboardGlobal: dashboardGlobalReducer,
  bills: billsReducer,
  chart: chartReducer,
  entry: entryReducer,
});
