'use strict';

import Promise from 'bluebird';
import { each } from 'async';

import { accounts, transactions } from '../models';

// transfer cash from one account to another
export const transferCash = parms => {
  return new Promise((resolve, reject) => {
    const accts = { from: { id: 0, balance: 0 }, to: { id: 0, balance: 0 } };
    const promises = [];
    promises.push(accounts.findById(parms.db, parms.from.id));
    promises.push(accounts.findById(parms.db, parms.to.id));
    Promise.all(promises)
      .then(accounts => {
        accts.from = accounts[0];
        accts.to = accounts[1];
      })
      // for account.from negate the amount.
      .then(() => updateAccount(parms, accts.from, parms.amount * -1, parms.seq))
      .then(() => updateAccount(parms, accts.to, parms.amount, parms.seq))
      .then(() => resolve())
      .catch(err => reject(err));
  });
};

// step 2.1 : update the balance amount into DB.
const updateAccount = (parms, acct, amount, seq) => {
  return new Promise((resolve, reject) => {
    // if acct# is 0, ignore.
    if (!acct.id) {
      return resolve();
    }
    const amt = acct.cash ? amount : amount * -1;
    accounts
      .update(parms.db, { id: acct.id }, { $inc: { balance: amt } })
      .then(() => {
        // if seq = 0, it is an 'add'. ignore the updateTransItemBalances step. that's used only for modify.
        if (!seq) {
          return resolve();
        }
        return updateTransItemBalances(parms, acct, amt, seq);
      })
      .then(() => resolve())
      .catch(err => reject(err));
  });
};

// step 2.1.1 : find all future trans post this trans & adjust the ac balances.
const updateTransItemBalances = (parms, acct, amount, seq) => {
  return new Promise((resolve, reject) => {
    transactions
      .findForAcct(parms.db, acct.cityId, acct.id)
      .then(trans => {
        each(
          trans,
          (tran, cb) => {
            // if seq is less, then it is an earlier transaction, ignore..
            if (tran.seq < seq) {
              return cb();
            }
            if (tran.accounts.from.id === acct.id) {
              tran.accounts.from.balanceBf += amount;
              tran.accounts.from.balanceAf += amount;
            } else if (tran.accounts.to.id === acct.id) {
              tran.accounts.to.balanceBf += amount;
              tran.accounts.to.balanceAf += amount;
            }
            updateTrans(parms, tran, err => cb(err));
          },
          err => (err ? reject(err) : resolve())
        );
      })
      .catch(err => reject(err));
  });
};

// step 2.1.1.1 : save the ac balances changes to DB.
const updateTrans = (parms, tr, next) => {
  transactions
    .update(
      parms.db,
      { id: tr.id },
      {
        $set: {
          'accounts.from.balanceBf': tr.accounts.from.balanceBf,
          'accounts.from.balanceAf': tr.accounts.from.balanceAf,
          'accounts.to.balanceBf': tr.accounts.to.balanceBf,
          'accounts.to.balanceAf': tr.accounts.to.balanceAf
        }
      }
    )
    .then(() => next())
    .catch(err => next(err));
};
