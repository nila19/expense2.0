import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from 'app/axios';
import { API } from 'app/config';
import { selectAppGlobal } from 'features/appGlobalSlice';

export const savePayBill = createAsyncThunk('billPay/savePayBill', async (payload, thunkApi) => {
  const { selectedCity } = selectAppGlobal(thunkApi.getState());
  await axios().post(API.BILL.PAY, { cityId: selectedCity, ...payload }, { snackbar: 'Bill pay' });
  thunkApi.dispatch(resetBillPay());
});

const billPaySlice = createSlice({
  name: 'billPay',
  initialState: null,
  reducers: {
    payBill: (state, action) => {
      return action.payload;
    },
    resetBillPay: () => {
      return null;
    },
  },
});

export const selectBillPay = (state) => state.dashboard.bills.billPay;

export const { payBill, resetBillPay } = billPaySlice.actions;
export default billPaySlice.reducer;
