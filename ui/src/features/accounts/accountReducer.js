import { combineReducers } from '@reduxjs/toolkit';

import accountsReducer from 'features/accounts/accountsSlice';
import accountEditReducer from 'features/accounts/accountEditSlice';

export default combineReducers({
  accounts: accountsReducer,
  accountEdit: accountEditReducer,
});
