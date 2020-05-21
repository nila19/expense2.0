'use strict';

import numeral from 'numeral';

import { billService } from 'data/services';

import { addExpense } from 'services/expense/add-service';

import { checkCityEditable } from 'utils/common-utils';

export const payBill = async ({ db }, data) => {
  await checkCityEditable(db, data.cityId);
  const tran = await addExpense({ db }, buildInput(data));
  await updateBill(db, data, tran);
  return tran;
};

// step 1: copy transaction data from input to transaction record.
const buildInput = (data) => {
  return {
    cityId: data.cityId,
    accounts: { from: data.account, to: data.bill.account },
    category: null,
    description: 'CC Bill Payment',
    amount: numeral(data.paidAmt).value(),
    transDt: data.paidDt,
    adhoc: false,
    adjust: true,
  };
};

// step 3 : save transaction to DB
const updateBill = async (db, data, tran) => {
  const payment = { id: tran.id, transDt: tran.transDt, amount: tran.amount };
  let balance = data.bill.balance - tran.amount;
  balance = balance > -0.01 && balance < 0.01 ? 0 : balance;
  await billService.addPayment(db, data.bill.id, balance, payment);
};
