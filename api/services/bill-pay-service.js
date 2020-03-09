'use strict';

import _ from 'lodash';

import { bills } from '../models';

import { addExpense } from './add-service';
import { checkCityEditable } from '../utils/common-utils';

export const payBill = async (parms, data) => {
  await checkCityEditable(parms.db, data.city.id);
  const tran = await addExpense(parms, buildInput(data));
  return await updateBill(parms, data, tran);
};

// step 1: copy transaction data from input to transaction record.
const buildInput = data => {
  return {
    city: data.city,
    accounts: { from: data.account, to: data.bill.account },
    category: null,
    description: 'CC Bill Payment',
    amount: _.toNumber(data.paidAmt),
    transDt: data.paidDt,
    adhoc: false,
    adjust: true
  };
};

// step 3 : save transaction to DB
const updateBill = async (parms, data, tran) => {
  const payment = { id: tran.id, transDt: tran.transDt, amount: tran.amount };
  let balance = data.bill.balance - tran.amount;
  balance = balance > -0.01 && balance < 0.01 ? 0 : balance;
  await bills.update(parms.db, { id: data.bill.id }, { $set: { balance: balance }, $push: { payments: payment } });
};
