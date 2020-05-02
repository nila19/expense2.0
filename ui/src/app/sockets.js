import io from 'socket.io-client';

import { BACKEND } from 'app/config';
import { updateAccount } from 'features/dashboard/accounts/accountsSlice';
import { createBill, updateBill } from 'features/dashboard/bills/billTab/billTabSlice';
import { createExpense, updateExpense, dropExpense } from 'features/search/expenses/expensesSlice';

const socket = io(BACKEND.BASE_URL);

export const PIPE = {
  ACCOUNT: 'account',
  BILL: 'bill',
  TRANS: 'transaction',
};

export const STATE = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED',
};

export const startListening = (dispatch) => {
  socket.on(PIPE.ACCOUNT, (payload) => {
    const { data } = payload;
    dispatch(updateAccount(data));
  });
  socket.on(PIPE.BILL, (payload) => {
    const { state, data } = payload;
    if (state === STATE.CREATED) {
      dispatch(createBill(data));
    } else {
      dispatch(updateBill(data));
    }
  });
  socket.on(PIPE.TRANS, (payload) => {
    const { state, data } = payload;
    if (state === STATE.CREATED) {
      dispatch(createExpense(data));
    } else if (state === STATE.DELETED) {
      dispatch(dropExpense(data));
    } else {
      dispatch(updateExpense(data));
    }
  });
};
