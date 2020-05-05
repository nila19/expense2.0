'use strict';

import { accountModel, transactionModel } from 'models';
import { checkCityEditable } from 'utils/common-utils';

export const swapExpenses = async (parms, data) => {
  const cityId = _.toNumber(data.cityId);
  await processSwapRow(parms, cityId, data.first, data.second);
};

// step 3: processes each swap row.
const processSwapRow = async (parms, cityId, first, second) => {
  const trans = {};
  const accts = {};
  const balances = {};
  await checkCityEditable(parms.db, cityId);
  await loadBothTrans(parms, first, second, trans, accts, balances);

  adjustAccountsSeq(trans);
  initializeBalances(trans, balances);
  replayTransactions(trans, accts, balances);
  await updateTransaction(parms, trans.first);
  await updateTransaction(parms, trans.second);
};

const loadBothTrans = async (parms, first, second, trans, accts, balances) => {
  trans.first = await fetchTran(parms, accts, balances, first.id);
  trans.second = await fetchTran(parms, accts, balances, second.id);
};

const fetchTran = async (parms, accts, balances, tranId) => {
  const tran = await transactionModel.findById(parms.db, tranId);
  await loadAcct(parms, accts, balances, tran.accounts.from.id);
  await loadAcct(parms, accts, balances, tran.accounts.to.id);
  return tran;
};

const loadAcct = async (parms, accts, balances, acctId) => {
  const acct = await accountModel.findById(parms.db, acctId);
  accts[acct.id] = acct;
  balances[acct.id] = 0;
};

// step 3.3: check seq of the 2 accounts & find out which is older.
const adjustAccountsSeq = (trans) => {
  let tran = null;
  let seq = 0;
  // oldest (the one with smaller seq) should be first.
  if (trans.second.seq < trans.first.seq) {
    // swap the trans positions.
    tran = trans.first;
    trans.first = trans.second;
    trans.second = tran;
  }
  // swap the seq#s.
  seq = trans.first.seq;
  trans.first.seq = trans.second.seq;
  trans.second.seq = seq;
};

// step 3.4: load Bf balances for accounts.
const initializeBalances = (trans, balances) => {
  // process in reverse chronological order. newest first.
  balances[trans.second.accounts.from.id] = trans.second.accounts.from.balanceBf;
  balances[trans.second.accounts.to.id] = trans.second.accounts.to.balanceBf;
  balances[trans.first.accounts.from.id] = trans.first.accounts.from.balanceBf;
  balances[trans.first.accounts.to.id] = trans.first.accounts.to.balanceBf;
};

// step 3.6: replay the transactions in the new order & update the account balances.
const replayTransactions = (trans, accts, balances) => {
  // replay the latest one first & then the older one..
  trans.second.accounts.from.balanceBf = balances[trans.second.accounts.from.id];
  trans.second.accounts.to.balanceBf = balances[trans.second.accounts.to.id];
  replayTran(accts, balances, trans.second);
  trans.second.accounts.from.balanceAf = balances[trans.second.accounts.from.id];
  trans.second.accounts.to.balanceAf = balances[trans.second.accounts.to.id];
  trans.first.accounts.from.balanceBf = balances[trans.first.accounts.from.id];
  trans.first.accounts.to.balanceBf = balances[trans.first.accounts.to.id];
  replayTran(accts, balances, trans.first);
  trans.first.accounts.from.balanceAf = balances[trans.first.accounts.from.id];
  trans.first.accounts.to.balanceAf = balances[trans.first.accounts.to.id];
};

// step 3.6.1: replay the transactions.
const replayTran = (accts, balances, tr) => {
  balances[tr.accounts.from.id] -= accts[tr.accounts.from.id].cash ? tr.amount : tr.amount * -1;
  balances[tr.accounts.to.id] += accts[tr.accounts.to.id].cash ? tr.amount : tr.amount * -1;
};

const updateTransaction = async (parms, tran) => {
  if (!tran.accounts.from.id) {
    await transactionModel.updateOne(
      parms.db,
      { id: tran.id },
      {
        $set: {
          'accounts.from.balanceBf': tran.accounts.from.balanceBf,
          'accounts.from.balanceAf': tran.accounts.from.balanceAf,
          seq: tran.seq,
        },
      }
    );
  }

  if (!tran.accounts.to.id) {
    await transactionModel.updateOne(
      parms.db,
      { id: tran.id },
      {
        $set: {
          'accounts.to.balanceBf': tran.accounts.to.balanceBf,
          'accounts.to.balanceAf': tran.accounts.to.balanceAf,
          seq: tran.seq,
        },
      }
    );
  }
};
