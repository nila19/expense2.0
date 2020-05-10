import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { axios } from 'app/axios';
import { API } from 'app/config';

import { prepareChartData } from 'features/utils';

export const loadChart = createAsyncThunk('chart/loadChart', async (cityId) => {
  const { data } = await axios().get(API.SUMMARY.CHART + cityId);
  return data.data;
});

const chartSlice = createSlice({
  name: 'chart',
  initialState: null,
  extraReducers: {
    [loadChart.fulfilled]: (state, action) => {
      return prepareChartData(action.payload);
    },
  },
});

export const selectChart = (state) => state.dashboard.chart;

export default chartSlice.reducer;
