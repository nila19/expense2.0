'use strict';

import { accountModel, transactionModel } from 'models';
import { transactionService } from 'data-services';
import { checkCityEditable } from 'utils/common-utils';

export const swapExpenses = async ({ db }, { cityId, first, second }) => {
  await checkCityEditable(db, cityId);
  const accounts = {};
  const balances = {};
  const trans = await loadBothTrans(db, first.id, second.id, accounts, balances);

  adjustAccountsSeq(trans);
  initializeBalances(trans, balances);
  replayTransactions(trans, accounts, balances);
  await transactionService.updateBalances(db, trans.first);
  await transactionService.updateBalances(db, trans.second);
};

const loadBothTrans = async (db, firstId, secondId, accounts, balances) => {
  const first = await fetchTran(db, accounts, balances, firstId);
  const second = await fetchTran(db, accounts, balances, secondId);
  return { first, second };
};

const fetchTran = async (db, accounts, balances, tranId) => {
  const tran = await transactionModel.findById(db, tranId);
  await loadAccount(db, accounts, balances, tran.accounts.from.id);
  await loadAccount(db, accounts, balances, tran.accounts.to.id);
  return tran;
};

const loadAccount = async (db, accounts, balances, acctId) => {
  const account = await accountModel.findById(db, acctId);
  accounts[account.id] = account;
  balances[account.id] = 0;
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
const replayTran = (accts, balances, tran) => {
  balances[tran.accounts.from.id] -= accts[tran.accounts.from.id].cash ? tran.amount : tran.amount * -1;
  balances[tran.accounts.to.id] += accts[tran.accounts.to.id].cash ? tran.amount : tran.amount * -1;
};
