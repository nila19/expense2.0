import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { axios } from 'app/axios';
import { API } from 'app/config';

import { setSelectedCity } from 'features/appGlobalSlice';
import { loadAccounts } from 'features/dashboard/accounts/accountSlice';
import { loadBills } from 'features/dashboard/bills/billTab/billTabSlice';
import { loadExpenses } from 'features/search/expenses/expenseSlice';

export const connectToBackend = createAsyncThunk('startup/connect', async (payload, thunkApi) => {
  const { data } = await axios().get(API.STARTUP.CONNECT);
  if (data.code === 0) {
    thunkApi.dispatch(loadCities());
    thunkApi.dispatch(loadDefaultCity());
  }
  return data.code === 0;
});

export const loadAppDataForCity = (cityId, dispatch) => {
  dispatch(loadCategories(cityId));
  dispatch(loadDescriptions(cityId));
  dispatch(loadTransMonths(cityId));
  dispatch(loadEntryMonths(cityId));
  dispatch(loadAccounts(cityId));
  dispatch(loadBills(cityId));
  dispatch(loadExpenses({ cityId: cityId }));
};

export const loadCities = createAsyncThunk('appGlobal/loadCities', async () => {
  const { data } = await axios().get(API.STARTUP.CITIES);
  return data.data;
});

export const loadDefaultCity = createAsyncThunk('appGlobal/loadDefaultCity', async (payload, thunkApi) => {
  const { data } = await axios().get(API.STARTUP.DEFAULT_CITY);
  thunkApi.dispatch(setSelectedCity(data.data.id));
});

export const loadCategories = createAsyncThunk('appGlobal/loadCategories', async (cityId) => {
  const { data } = await axios().get(API.STARTUP.CATEGORIES + cityId);
  return data.data;
});

export const loadDescriptions = createAsyncThunk('appGlobal/loadDescriptions', async (cityId) => {
  const { data } = await axios().get(API.STARTUP.DESCRIPTIONS + cityId);
  return data.data;
});

export const loadTransMonths = createAsyncThunk('appGlobal/loadTransMonths', async (cityId) => {
  const { data } = await axios().get(API.STARTUP.TRANS_MONTHS + cityId);
  return data.data;
});

export const loadEntryMonths = createAsyncThunk('appGlobal/loadEntryMonths', async (cityId) => {
  const { data } = await axios().get(API.STARTUP.ENTRY_MONTHS + cityId);
  return data.data;
});

export const STATE = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED',
};

const startupSlice = createSlice({
  name: 'startup',
  initialState: {
    connection: STATE.NOT_STARTED,
    data: { cities: [], categories: [], descriptions: [], transMonths: [], entryMonths: [] },
    loading: {
      cities: STATE.NOT_STARTED,
      categories: STATE.NOT_STARTED,
      descriptions: STATE.NOT_STARTED,
      transMonths: STATE.NOT_STARTED,
      entryMonths: STATE.NOT_STARTED,
    },
  },
  extraReducers: {
    [connectToBackend.pending]: (state) => {
      state.connection = STATE.PENDING;
    },
    [connectToBackend.fulfilled]: (state) => {
      state.connection = STATE.FULFILLED;
    },
    [connectToBackend.rejected]: (state) => {
      state.connection = STATE.REJECTED;
    },
    [loadCities.pending]: (state) => {
      state.loading.cities = STATE.PENDING;
    },
    [loadCities.rejected]: (state) => {
      state.loading.cities = STATE.REJECTED;
    },
    [loadCities.fulfilled]: (state, action) => {
      state.data.cities = action.payload;
      state.loading.cities = STATE.FULFILLED;
    },
    [loadCategories.pending]: (state) => {
      state.loading.categories = STATE.PENDING;
    },
    [loadCategories.rejected]: (state) => {
      state.loading.categories = STATE.REJECTED;
    },
    [loadCategories.fulfilled]: (state, action) => {
      state.data.categories = action.payload;
      state.loading.categories = STATE.FULFILLED;
    },
    [loadDescriptions.pending]: (state) => {
      state.loading.descriptions = STATE.PENDING;
    },
    [loadDescriptions.rejected]: (state) => {
      state.loading.descriptions = STATE.REJECTED;
    },
    [loadDescriptions.fulfilled]: (state, action) => {
      state.data.descriptions = action.payload;
      state.loading.descriptions = STATE.FULFILLED;
    },
    [loadTransMonths.pending]: (state) => {
      state.loading.transMonths = STATE.PENDING;
    },
    [loadTransMonths.rejected]: (state) => {
      state.loading.transMonths = STATE.REJECTED;
    },
    [loadTransMonths.fulfilled]: (state, action) => {
      state.data.transMonths = action.payload;
      state.loading.transMonths = STATE.FULFILLED;
    },
    [loadEntryMonths.pending]: (state) => {
      state.loading.entryMonths = STATE.PENDING;
    },
    [loadEntryMonths.rejected]: (state) => {
      state.loading.entryMonths = STATE.REJECTED;
    },
    [loadEntryMonths.fulfilled]: (state, action) => {
      state.data.entryMonths = action.payload;
      state.loading.entryMonths = STATE.FULFILLED;
    },
  },
});

export const selectStartup = (state) => state.startup;
export const selectStartupData = (state) => state.startup.data;

export default startupSlice.reducer;
