'use strict';

import { MONTH_TYPE } from 'config/formats';
import { accountModel, billModel, descriptionModel, monthModel, summaryModel, transactionModel } from 'models';
import { transferCash } from 'services/cash-service';
import { checkCityEditable, checkAccountsActive } from 'utils/common-utils';

export const deleteExpense = async (parms) => {
  const tran = await transactionModel.findById(parms.db, parms.transId);
  await checkCityEditable(parms.db, tran.cityId);
  const accts = await fetchAccounts(parms, tran);
  checkAccountsActive(true, accts.from, accts.to);

  // reverse the from / to accounts to reverse cash.
  await transferCash({ db: parms.db, from: accts.to, to: accts.from, amount: tran.amount, seq: tran.seq });
  await modifyBillBalance(parms, tran);
  await transactionModel.deleteOne(parms.db, { id: parms.transId });

  // undo lookup / summary tables for old values
  await descriptionModel.decrement(parms.db, tran.cityId, tran.description);
  await monthModel.decrement(parms.db, tran.cityId, MONTH_TYPE.ENTRY, tran.entryMonth);
  await monthModel.decrement(parms.db, tran.cityId, MONTH_TYPE.TRANS, tran.transMonth);
  if (!tran.adjust) {
    const category = { id: tran.category.id, name: tran.category.name };
    await summaryModel.decrement(parms.db, tran.cityId, category, tran.transMonth, tran.adhoc, tran.amount);
  }
};

// step 3: fetch from & to accounts info from DB
const fetchAccounts = async (parms, tran) => {
  const accts = { from: { id: 0, balance: 0 }, to: { id: 0, balance: 0 } };
  accts.from = await accountModel.findById(parms.db, tran.accounts.from.id);
  accts.to = await accountModel.findById(parms.db, tran.accounts.to.id);
  return accts;
};

// step 4: if the expense has been included in a bill, deduct the bill amount & balance.
const modifyBillBalance = async (parms, tr) => {
  if (tr.bill) {
    await billModel.findOneAndUpdate(
      parms.db,
      { id: tr.bill.id },
      { $inc: { amount: -tr.amount, balance: -tr.amount } }
    );
  }
};
