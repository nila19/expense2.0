'use strict';

import { accounts, bills, transactions } from '../models';

import { transferCash } from './cash-service';
import { checkCityEditable, checkAccountsActive } from '../utils/common-utils';

export const deleteExpense = async (parms) => {
  const tran = await transactions.findById(parms.db, parms.transId);
  await checkCityEditable(parms.db, tran.cityId);
  const accts = await fetchAccounts(parms, tran);
  checkAccountsActive(true, accts.from, accts.to);

  // reverse the from / to accounts to reverse cash.
  await transferCash({ db: parms.db, from: accts.to, to: accts.from, amount: tran.amount, seq: tran.seq });
  await modifyBillBalance(parms, tran);
  await transactions.deleteOne(parms.db, { id: parms.transId });
};

// step 3: fetch from & to accounts info from DB
const fetchAccounts = async (parms, tran) => {
  const accts = { from: { id: 0, balance: 0 }, to: { id: 0, balance: 0 } };
  accts.from = await accounts.findById(parms.db, tran.accounts.from.id);
  accts.to = await accounts.findById(parms.db, tran.accounts.to.id);
  return accts;
};

// step 4: if the expense has been included in a bill, deduct the bill amount & balance.
const modifyBillBalance = async (parms, tr) => {
  if (tr.bill) {
    await bills.findOneAndUpdate(parms.db, { id: tr.bill.id }, { $inc: { amount: -tr.amount, balance: -tr.amount } });
  }
};
