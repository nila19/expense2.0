import { createSlice } from '@reduxjs/toolkit';

const dashboardGlobalSlice = createSlice({
  name: 'dashboardGlobal',
  initialState: {
    accountFilter: null,
    billFilter: null,
  },
  reducers: {
    setAccountFilter: (state, action) => {
      state.accountFilter = action.payload;
    },
    setBillFilter: (state, action) => {
      state.billFilter = action.payload;
    },
    resetFilters: (state) => {
      state.accountFilter = null;
      state.billFilter = null;
    },
  },
});

export const selectDashboardGlobal = (state) => state.dashboard.dashboardGlobal;

export const { setAccountFilter, setBillFilter, resetFilters } = dashboardGlobalSlice.actions;
export default dashboardGlobalSlice.reducer;
