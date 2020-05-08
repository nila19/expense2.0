import { combineReducers } from '@reduxjs/toolkit';

import billTabReducer from 'features/dashboard/bills/billTab/billTabSlice';
import billPayReducer from 'features/dashboard/bills/billPay/billPaySlice';

export default combineReducers({
  billTab: billTabReducer,
  billPay: billPayReducer,
});
