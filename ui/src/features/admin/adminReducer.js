import { combineReducers } from '@reduxjs/toolkit';

import addFormReducer from 'features/admin/form/addFormSlice';

export default combineReducers({
  addForm: addFormReducer,
});
