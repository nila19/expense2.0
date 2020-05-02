import { createSlice } from '@reduxjs/toolkit';

const searchGlobalSlice = createSlice({
  name: 'searchGlobal',
  initialState: {
    retainForm: false,
  },
  reducers: {
    retainForm: (state) => {
      state.retainForm = true;
    },
    clearForm: (state) => {
      state.retainForm = false;
    },
  },
});

export const selectSearchGlobal = (state) => state.search.searchGlobal;

export const { retainForm, clearForm } = searchGlobalSlice.actions;
export default searchGlobalSlice.reducer;
