import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import _ from 'lodash';

import { axios } from 'app/axios';
import { API } from 'app/config';

import { setSelectedCity } from 'features/appGlobalSlice';
import { loadAccounts } from 'features/accounts/accountSlice';
import { loadBills } from 'features/dashboard/bills/billTab/billTabSlice';
import { loadExpenses } from 'features/search/expenses/expenseSlice';
import { loadSummary } from 'features/summary/summarySlice';

export const connectToBackend = createAsyncThunk('startup/connect', async (payload, thunkApi) => {
  const { data } = await axios().get(API.STARTUP.CONNECT);
  if (data.code === 0) {
    thunkApi.dispatch(loadCities());
    thunkApi.dispatch(loadDefaultCity());
  }
  return data;
});

export const setReloadDashboard = createAsyncThunk('startup/reloadDashboardData', async (payload, thunkApi) => {
  reloadDashboardData(payload, thunkApi.dispatch);
  return payload;
});

const reloadDashboardData = (cityId, dispatch) => {
  const payload = { cityId: cityId };
  dispatch(loadCategories(payload));
  dispatch(loadDescriptions(payload));
  dispatch(loadTransMonths(payload));
  dispatch(loadEntryMonths(payload));
  dispatch(loadAccounts(payload));
  dispatch(loadBills(payload));
};

export const loadAppDataForCity = (cityId, dispatch) => {
  const payload = { cityId: cityId };
  dispatch(loadCategories(payload));
  dispatch(loadDescriptions(payload));
  dispatch(loadTransMonths(payload));
  dispatch(loadEntryMonths(payload));
  dispatch(loadAccounts(payload));
  dispatch(loadBills(payload));
  dispatch(loadExpenses(payload));
  dispatch(loadSummary(payload));
};

export const loadCities = createAsyncThunk('appGlobal/loadCities', async () => {
  const { data } = await axios().get(API.STARTUP.CITIES);
  return data.data;
});

export const loadDefaultCity = createAsyncThunk('appGlobal/loadDefaultCity', async (payload, thunkApi) => {
  const { data } = await axios().get(API.STARTUP.DEFAULT_CITY);
  thunkApi.dispatch(setSelectedCity(data.data.id));
});

export const loadCategories = createAsyncThunk('appGlobal/loadCategories', async (payload) => {
  const { data } = await axios().post(API.STARTUP.CATEGORIES, payload);
  return data.data;
});

export const loadDescriptions = createAsyncThunk('appGlobal/loadDescriptions', async (payload) => {
  const { data } = await axios().post(API.STARTUP.DESCRIPTIONS, payload);
  return data.data;
});

export const loadTransMonths = createAsyncThunk('appGlobal/loadTransMonths', async (payload) => {
  const { data } = await axios().post(API.STARTUP.TRANS_MONTHS, payload);
  return data.data;
});

export const loadEntryMonths = createAsyncThunk('appGlobal/loadEntryMonths', async (payload) => {
  const { data } = await axios().post(API.STARTUP.ENTRY_MONTHS, payload);
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
    env: null,
    data: { cities: [], categories: [], descriptions: [], transMonths: [], entryMonths: [] },
    loading: {
      cities: STATE.NOT_STARTED,
      categories: STATE.NOT_STARTED,
      descriptions: STATE.NOT_STARTED,
      transMonths: STATE.NOT_STARTED,
      entryMonths: STATE.NOT_STARTED,
    },
    reloadDashboard: false,
  },
  extraReducers: {
    [connectToBackend.pending]: (state) => {
      state.connection = STATE.PENDING;
    },
    [connectToBackend.fulfilled]: (state, action) => {
      state.env = action.payload.data.env;
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
      resetReload(state);
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
      resetReload(state);
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
      resetReload(state);
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
      resetReload(state);
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
      resetReload(state);
    },
    [setReloadDashboard.pending]: (state, action) => {
      state.reloadDashboard = true;
      console.log('Setting Reload to ' + state.reloadDashboard);
    },
  },
});

const resetReload = (state) => {
  const allLoaded = allLoadingCompleted(state);
  if (state.reloadDashboard && allLoaded) {
    state.reloadDashboard = false;
    console.log('Resetting Reload to ' + state.reloadDashboard);
  }
};

export const allLoadingCompleted = (state) => {
  const loading = state.loading;
  const loadings = [loading.cities, loading.categories, loading.descriptions, loading.transMonths, loading.entryMonths];
  return _.every(loadings, (e) => e === STATE.FULFILLED);
};

export const anyLoadingFailed = (state) => {
  const loading = state.loading;
  const loadings = [loading.cities, loading.categories, loading.descriptions, loading.transMonths, loading.entryMonths];
  return _.some(loadings, (e) => e === STATE.REJECTED);
};

export const selectStartup = (state) => state.startup;
export const selectStartupData = (state) => state.startup.data;
export const selectStartupReload = (state) => {
  return {
    reloadDashboard: state.startup.reloadDashboard,
    loadingCompleted: allLoadingCompleted(state.startup),
    loadingFailed: anyLoadingFailed(state.startup),
  };
};

export default startupSlice.reducer;
