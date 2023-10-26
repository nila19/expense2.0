import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
// import { createLogger } from 'redux-logger';

import appGlobalReducer from 'features/appGlobalSlice';
import startupReducer from 'features/startup/startupSlice';
import dashboardReducer from 'features/dashboard/dashboardReducer';
import searchReducer from 'features/search/searchReducer';
import summaryReducer from 'features/summary/summarySlice';
import adminReducer from 'features/admin/adminReducer';

// disabling these 2 default middleware since they are causing slow down.
const customizedMiddleware = getDefaultMiddleware({
  immutableCheck: false,
  serializableCheck: false,
});

// const loggerMiddleware = createLogger();

export const store = configureStore({
  reducer: {
    appGlobal: appGlobalReducer,
    startup: startupReducer,
    dashboard: dashboardReducer,
    search: searchReducer,
    summary: summaryReducer,
    admin: adminReducer,
  },
  middleware: [...customizedMiddleware],
});
