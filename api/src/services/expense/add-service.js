'use strict';

import { COLLECTION } from 'config/constants';

import { sequenceModel } from 'data/models';
import { billService, transactionService } from 'data/services';

import { transferCash } from 'services/cash-service';
import { addToLookups } from 'services/lookup-services';
import { buildTranBasic, buildTranAccountsAdd, buildTranBillAdd } from 'services/expense/expense-utils';

import { checkCityEditable, fetchAccounts } from 'utils/common-utils';

export const addExpense = async ({ db }, data) => {
  await checkCityEditable(db, data.cityId);

  const tran = await buildTran(db, data);
  await transactionService.addTransaction(db, tran);
  await transferCash({
    db: db,
    from: data.accounts.from,
    to: data.accounts.to,
    amount: tran.amount,
    seq: 0,
  });

  if (tran.bill?.id) {
    await billService.incrementBillAmt(db, tran.bill.id, tran.amount);
  }

  // re-fetch from DB to get the revised balances after cash transfer
  const { from, to } = await fetchAccounts(db, data.accounts);
  await transactionService.updateBalanceAf(db, tran.id, from.balance, to.balance);

  // update lookup / summary tables with new values
  await addToLookups(db, tran);
  return await transactionService.findById(db, tran.id);
};

const buildTran = async (db, data) => {
  // fetch from & to accounts info from DB
  const accounts = await fetchAccounts(db, data.accounts);
  const seq = await sequenceModel.findNextSeq(db, data.cityId, COLLECTION.TRANSACTION);
  const tranBasic = buildTranBasic(data);
  const tranAccts = buildTranAccountsAdd(accounts, data.adjust);
  const tranBill = buildTranBillAdd(accounts);
  return { ...tranBasic, ...tranAccts, ...tranBill, id: seq, seq };
};
