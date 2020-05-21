import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { axios } from 'app/axios';
import { API } from 'app/config';

import { selectAppGlobal } from 'features/appGlobalSlice';

export const loadSummary = createAsyncThunk('summary/loadSummary', async (payload = {}, thunkApi) => {
  const { selectedCity } = selectAppGlobal(thunkApi.getState());
  let { forecast = false, regular = true, adhoc = true, cityId = null } = payload;
  cityId = cityId || selectedCity;
  const { data } = await axios().post(API.SUMMARY.SUMMARY, { cityId, forecast, regular, adhoc });
  return data.data;
});

const summarySlice = createSlice({
  name: 'summary',
  initialState: {
    loading: false,
    data: { months: [], gridRows: [], totalRow: [] },
  },
  extraReducers: {
    [loadSummary.pending]: (state, action) => {
      state.loading = true;
    },
    [loadSummary.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.loading = false;
    },
    [loadSummary.rejected]: (state, action) => {
      state.loading = false;
    },
  },
});

export const selectSummary = (state) => state.summary;

export default summarySlice.reducer;
