import { createAsyncThunk } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { axios } from 'app/axios';
import { API } from 'app/config';
import { selectAppGlobal } from 'features/appGlobalSlice';

export const addAccount = createAsyncThunk('admin/addAccount', async (payload, thunkApi) => {
  const { selectedCity } = selectAppGlobal(thunkApi.getState());
  await axios().post(API.ACCOUNT.ADD, { cityId: selectedCity, ...payload }, { snackbar: 'Account addition' });
});

const addFormSlice = createSlice({
  name: 'addForm',
  initialState: {
    name: null,
    cash: null,
    billed: false,
    icon: null,
    color: null,
    seq: 999,
    closingDay: 5,
    dueDay: 5,
    balance: 0,
    active: true,
  },
  reducers: {
    setName: (state, action) => {
      state.name = action.payload.value;
    },
    setCash: (state, action) => {
      state.cash = action.payload.value;
    },
  },
});

export const selectAddForm = (state) => state.admin.addForm;

export const { setName, setCash } = addFormSlice.actions;
export default addFormSlice.reducer;
