'use strict';

import { cityModel } from 'data/models';
import { accountService } from 'data/services';

export const checkCityEditable = async (db, id) => {
  const city = await cityModel.findById(db, id);
  if (!city.active) {
    throw new Error('City is not active.');
  }
};

export const checkAccountsActive = ({ from, to }) => {
  if ((from?.id && !from.active) || (to?.id && !to.active)) {
    throw new Error('Change invalid. Account(s) involved are not active...');
  }
};

export const buildBillName = ({ name }, { id, billDt }) => {
  return id ? name + ' : ' + billDt + ' #' + id : name + ' #0';
};

export const fetchAccounts = async (db, accounts) => {
  const from = await accountService.findById(db, accounts.from?.id || 0);
  const to = await accountService.findById(db, accounts.to?.id || 0);
  return { from, to };
};
