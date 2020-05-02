import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { loadAppDataForCity } from 'features/startup/startupSlice';

export const setSelectedCity = createAsyncThunk('appGlobal/setSelectedCity', async (payload, thunkApi) => {
  loadAppDataForCity(payload, thunkApi.dispatch);
  return payload;
});

const appGlobalSlice = createSlice({
  name: 'appGlobal',
  initialState: {
    selectedCity: null,
    accountsExpanded: false,
  },
  reducers: {
    setAccountsExpanded: (state, action) => {
      state.accountsExpanded = action.payload;
    },
  },
  extraReducers: {
    [setSelectedCity.fulfilled]: (state, action) => {
      state.selectedCity = action.payload;
    },
  },
});

export const selectAppGlobal = (state) => state.appGlobal;

export const { setAccountsExpanded } = appGlobalSlice.actions;
export default appGlobalSlice.reducer;
