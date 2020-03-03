'use strict';

import Promise from 'bluebird';

import { accounts, bills, transactions } from '../models';

import { transferCash } from './cash-service';
import { checkCityEditable, checkAccountsActive, logErr } from '../utils/common-utils';

export const deleteExpense = (parms, next) => {
  let _trans = null;
  let _accts = null;
  transactions
    .findById(parms.db, parms.transId)
    .then(trans => {
      _trans = trans;
      return checkCityEditable(parms.db, _trans.cityId);
    })
    .then(() => getAccountsInfo(parms, _trans))
    .then(accts => {
      _accts = accts;
      return checkAccountsActive(true, _accts.from, _accts.to);
    })
    // reverse the from / to accounts to reverse cash.
    .then(() =>
      transferCash({ db: parms.db, from: _accts.to, to: _accts.from, amount: _trans.amount, seq: _trans.seq })
    )
    .then(() => modifyBillBalance(parms, _trans))
    .then(() => transactions.remove(parms.db, { id: parms.transId }))
    .then(() => next())
    .catch(err => {
      logErr(parms.log, err);
      return next(err);
    });
};

// step 3: fetch from & to accounts info from DB
const getAccountsInfo = (parms, tr) => {
  return new Promise((resolve, reject) => {
    const accts = { from: { id: 0, balance: 0 }, to: { id: 0, balance: 0 } };
    const promises = [];
    promises.push(accounts.findById(parms.db, tr.accounts.from.id));
    promises.push(accounts.findById(parms.db, tr.accounts.to.id));
    Promise.all(promises)
      .then(accounts => {
        accts.from = accounts[0];
        accts.to = accounts[1];
        return resolve(accts);
      })
      .catch(err => reject(err));
  });
};

// step 4: if the expense has been included in a bill, deduct the bill amount & balance.
const modifyBillBalance = (parms, tr) => {
  return new Promise((resolve, reject) => {
    if (!tr.bill) {
      return resolve();
    }
    bills
      .findOneAndUpdate(parms.db, { id: tr.bill.id }, { $inc: { amount: -tr.amount, balance: -tr.amount } })
      .then(() => resolve())
      .catch(err => reject(err));
  });
};
