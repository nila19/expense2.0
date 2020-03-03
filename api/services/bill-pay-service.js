'use strict';

import _ from 'lodash';
import Promise from 'bluebird';

import { bills } from '../models';

import { addExpensePromise } from './add-service';
import { checkCityEditable, logErr } from '../utils/common-utils';

export const payBill = (parms, data, next) => {
  let _trans = null;
  checkCityEditable(parms.db, data.city.id)
    .then(() => buildTransInput(data))
    .then(input => addExpensePromise(parms, input))
    .then(trans => {
      _trans = trans;
      return updateBill(parms, data, trans);
    })
    .then(() => next(null, _trans))
    .catch(err => {
      logErr(parms.log, err);
      return next(err);
    });
};

// step 2: copy transaction data from input to transaction record.
const buildTransInput = data => {
  return new Promise(resolve => {
    const input = {
      city: data.city,
      accounts: { from: data.account, to: data.bill.account },
      category: null,
      description: 'CC Bill Payment',
      amount: _.toNumber(data.paidAmt),
      transDt: data.paidDt,
      adhoc: false,
      adjust: true
    };
    return resolve(input);
  });
};

// step 5 : save transaction to DB
const updateBill = (parms, data, trans) => {
  return new Promise((resolve, reject) => {
    const payment = { id: trans.id, transDt: trans.transDt, amount: trans.amount };
    let balance = data.bill.balance - trans.amount;
    balance = balance > -0.01 && balance < 0.01 ? 0 : balance;
    bills
      .update(parms.db, { id: data.bill.id }, { $set: { balance: balance }, $push: { payments: payment } })
      .then(() => resolve())
      .catch(err => reject(err));
  });
};
