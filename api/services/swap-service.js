'use strict';

import { accounts, transactions } from '../models';

import { checkCityEditable } from '../utils/common-utils';

export const swapExpenses = async (parms, data) => {
  for (const item of data) {
    await processSwapRow(parms, item.fromTrans, item.toTrans);
  }
};

// step 3: processes each swap row.
const processSwapRow = async (parms, one, two) => {
  const accts = {};
  const balances = {};
  const trans = await loadBothTrans(parms, one, two, accts, balances);
  await checkCityEditable(parms.db, trans.first.cityId);

  adjustAccountsSeq(trans);
  initializeBalances(trans, balances);
  replayTransactions(trans, accts, balances);
  await updateTransactions(parms, trans);
};

const loadBothTrans = async (parms, one, two, accts, balances) => {
  const trans = { first: { id: 0 }, second: { id: 0 } };
  trans.first = await fetchTran(parms, accts, balances, one);
  trans.second = await fetchTran(parms, accts, balances, two);
  return trans;
};

const fetchTran = async (parms, accts, balances, tranId) => {
  const tran = await transactions.findById(parms.db, tranId);
  await loadAcct(parms, accts, balances, trans.accounts.from.id);
  await loadAcct(parms, accts, balances, trans.accounts.to.id);
  return tran;
};

const loadAcct = async (parms, accts, balances, acctId) => {
  const acct = await accounts.findById(parms.db, acctId);
  accts[acct.id] = acct;
  balances[acct.id] = 0;
};

// step 3.3: check seq of the 2 accounts & find out which is older.
const adjustAccountsSeq = trans => {
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

const updateTransactions = async (parms, trans) => {
  if (!trans.accounts.from.id) {
    await transactions.update(
      parms.db,
      { id: trans.id },
      {
        $set: {
          'accounts.from.balanceBf': trans.accounts.from.balanceBf,
          'accounts.from.balanceAf': trans.accounts.from.balanceAf,
          seq: trans.seq
        }
      }
    );
  }

  if (!trans.accounts.to.id) {
    await transactions.update(
      parms.db,
      { id: trans.id },
      {
        $set: {
          'accounts.to.balanceBf': trans.accounts.to.balanceBf,
          'accounts.to.balanceAf': trans.accounts.to.balanceAf,
          seq: trans.seq
        }
      }
    );
  }
};
