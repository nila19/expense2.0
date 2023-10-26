import { combineReducers } from '@reduxjs/toolkit';

import addAccountReducer from 'features/admin/add/addAccountSlice';
import accountsReducer from 'features/admin/list/accountsSlice';

export default combineReducers({
  addAccount: addAccountReducer,
  accounts: accountsReducer,
});
