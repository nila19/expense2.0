'use strict';

import { each } from 'async';
import Promise from 'bluebird';

import { accounts, transactions } from '../models';

import { logErr, checkCityEditable } from '../utils/common-utils';

export const swapExpenses = (parms, data, next) => {
  each(
    data,
    (item, cb) => {
      processSwapRow(parms, item.fromTrans, item.toTrans, err => cb(err));
    },
    err => {
      logErr(parms.log, err);
      return next(err);
    }
  );
};

// step 3: processes each swap row.
const processSwapRow = (parms, one, two, next) => {
  const _trans = { first: { id: 0 }, second: { id: 0 } };
  const accts = {};
  const balances = {};
  Promise.all([getTrans(parms, accts, balances, one), getTrans(parms, accts, balances, two)])
    .then(trans => {
      _trans.first = trans[0];
      _trans.second = trans[1];
    })
    .then(() => checkCityEditable(parms.db, _trans.first.cityId))
    .then(() => adjustAccountsSeq(_trans))
    .then(() => initializeBalances(_trans, balances))
    .then(() => replayTransactions(_trans, accts, balances))
    .then(() => updateTransactions(parms, _trans))
    .then(() => next())
    .catch(err => next(err));
};

const getTrans = (parms, accts, balances, id) => {
  return new Promise((resolve, reject) => {
    let _trans = null;
    transactions
      .findById(parms.db, id)
      .then(trans => {
        _trans = trans;
        const promises = [];
        promises.push(accounts.findById(parms.db, trans.accounts.from.id));
        promises.push(accounts.findById(parms.db, trans.accounts.to.id));
        return Promise.all(promises);
      })
      .then(accounts => {
        accounts.forEach(ac => {
          accts[ac.id] = ac;
          balances[ac.id] = 0;
        });
        return resolve(_trans);
      })
      .catch(err => reject(err));
  });
};

// step 3.3: check seq of the 2 accounts & find out which is older.
const adjustAccountsSeq = trans => {
  return new Promise(resolve => {
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
    return resolve();
  });
};

// step 3.4: load Bf balances for accounts.
const initializeBalances = (trans, balances) => {
  return new Promise(resolve => {
    // process in reverse chronological order. newest first.
    balances[trans.second.accounts.from.id] = trans.second.accounts.from.balanceBf;
    balances[trans.second.accounts.to.id] = trans.second.accounts.to.balanceBf;
    balances[trans.first.accounts.from.id] = trans.first.accounts.from.balanceBf;
    balances[trans.first.accounts.to.id] = trans.first.accounts.to.balanceBf;
    return resolve();
  });
};

// step 3.6: replay the transactions in the new order & update the account balances.
const replayTransactions = (trans, accts, balances) => {
  return new Promise(resolve => {
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
    return resolve();
  });
};

// step 3.6.1: replay the transactions.
const replayTran = (accts, balances, tr) => {
  balances[tr.accounts.from.id] -= accts[tr.accounts.from.id].cash ? tr.amount : tr.amount * -1;
  balances[tr.accounts.to.id] += accts[tr.accounts.to.id].cash ? tr.amount : tr.amount * -1;
};

const updateTransactions = (parms, trans) => {
  return new Promise((resolve, reject) => {
    const promises = [];
    buildUpdatePromises(parms, trans.first, promises);
    buildUpdatePromises(parms, trans.second, promises);
    Promise.all(promises)
      .then(() => resolve())
      .catch(err => reject(err));
  });
};

const buildUpdatePromises = (parms, trans, promises) => {
  if (!trans.accounts.from.id) {
    promises.push(
      transactions.update(
        parms.db,
        { id: trans.id },
        {
          $set: {
            'accounts.from.balanceBf': trans.accounts.from.balanceBf,
            'accounts.from.balanceAf': trans.accounts.from.balanceAf,
            seq: trans.seq
          }
        }
      )
    );
  }
  if (!trans.accounts.to.id) {
    promises.push(
      transactions.update(
        parms.db,
        { id: trans.id },
        {
          $set: {
            'accounts.to.balanceBf': trans.accounts.to.balanceBf,
            'accounts.to.balanceAf': trans.accounts.to.balanceAf,
            seq: trans.seq
          }
        }
      )
    );
  }
};
