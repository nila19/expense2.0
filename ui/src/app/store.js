import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
// import { createLogger } from 'redux-logger';

import startupReducer from 'features/startup/startupSlice';
import appGlobalReducer from 'features/appGlobalSlice';
import searchReducer from 'features/search/searchReducer';
import dashboardReducer from 'features/dashboard/dashboardReducer';

// disabling these 2 default middleware since they are causing slow down.
const customizedMiddleware = getDefaultMiddleware({
  immutableCheck: false,
  serializableCheck: false,
});

// const loggerMiddleware = createLogger();

export const store = configureStore({
  reducer: {
    startup: startupReducer,
    appGlobal: appGlobalReducer,
    search: searchReducer,
    dashboard: dashboardReducer,
  },
  middleware: [...customizedMiddleware],
});
