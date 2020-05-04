import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import _ from 'lodash';

import axios from 'app/axios';
import { API } from 'app/config';

export const loadBills = createAsyncThunk('billTab/loadBills', async (cityId) => {
  const { data } = await axios().get(API.STARTUP.BILLS + cityId);
  return data.data;
});

export const closeBill = createAsyncThunk('billTab/closeBill', async (billId) => {
  await axios().post(API.BILL.CLOSE, { id: billId }, { snackbar: 'Bill close' });
});

const billTabSlice = createSlice({
  name: 'billTab',
  initialState: [],
  reducers: {
    createBill: (state, action) => {
      state.push(action.payload);
    },
    updateBill: (state, action) => {
      const index = _.findIndex(state, { id: action.payload.id });
      if (index >= 0) {
        state[index] = action.payload;
      }
    },
  },
  extraReducers: {
    [loadBills.fulfilled]: (state, action) => {
      return action.payload;
    },
  },
});

export const selectBills = (state) => state.dashboard.bills.billTab;

export const { createBill, updateBill } = billTabSlice.actions;
export default billTabSlice.reducer;
