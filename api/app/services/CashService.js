'use strict';

const Promise = require('bluebird');
const async = require('async');
const accounts = require('../models/Accounts')();
const transactions = require('../models/Transactions')();

//* *************************************************//
// this service transfers cash from one account to another.
const transferCash = function (parms) {
  return new Promise(function (resolve, reject) {
    const accts = {from: {id: 0, balance: 0}, to: {id: 0, balance: 0}};
    const promises = [];

    promises.push(accounts.findById(parms.db, parms.from.id));
    promises.push(accounts.findById(parms.db, parms.to.id));
    Promise.all(promises).then((accounts) => {
      accts.from = accounts[0];
      accts.to = accounts[1];
    }).then(() => {
    // for account.from negate the amount.
      return updateAccount(parms, accts.from, (parms.amount * -1), parms.seq);
    }).then(() => {
      return updateAccount(parms, accts.to, parms.amount, parms.seq);
    }).then(() => {
      return resolve();
    }).catch((err) => {
      return reject(err);
    });
  });
};

// step 2.1 : update the balance amount into DB.
const updateAccount = function (parms, acct, amount, seq) {
  return new Promise(function (resolve, reject) {
    // if acct# is 0, ignore.
    if(!acct.id) {
      return resolve();
    }
    const amt = acct.cash ? amount : amount * -1;

    accounts.update(parms.db, {id: acct.id}, {$inc: {balance: amt}}).then(() => {
    // if seq = 0, it is an 'add'. ignore the updateTransItemBalances step. that's used only for modify.
      if(!seq) {
        return resolve();
      }
      return updateTransItemBalances(parms, acct, amt, seq);
    }).then(() => {
      return resolve();
    }).catch((err) => {
      return reject(err);
    });
  });
};

// step 2.1.1 : find all future trans post this trans & adjust the ac balances.
const updateTransItemBalances = function (parms, acct, amount, seq) {
  return new Promise(function (resolve, reject) {
    transactions.findForAcct(parms.db, acct.cityId, acct.id).then((trans) => {
      async.each(trans, function (tran, cb) {
      // if seq is less, then it is an earlier transaction, ignore..
        if(tran.seq < seq) {
          return cb();
        }
        if(tran.accounts.from.id === acct.id) {
          tran.accounts.from.balanceBf += amount;
          tran.accounts.from.balanceAf += amount;
        } else if( tran.accounts.to.id === acct.id) {
          tran.accounts.to.balanceBf += amount;
          tran.accounts.to.balanceAf += amount;
        }
        updateTrans(parms, tran, function (err) {
          return cb(err);
        });
      }, function (err) {
        return err ? reject(err) : resolve();
      });
    }).catch((err) => {
      return reject(err);
    });
  });
};

// step 2.1.1.1 : save the ac balances changes to DB.
const updateTrans = function (parms, tr, next) {
  transactions.update(parms.db, {id: tr.id},
    {$set: {'accounts.from.balanceBf': tr.accounts.from.balanceBf,
      'accounts.from.balanceAf': tr.accounts.from.balanceAf,
      'accounts.to.balanceBf': tr.accounts.to.balanceBf,
      'accounts.to.balanceAf': tr.accounts.to.balanceAf}}).then(() => {
        return next();
      }).catch((err) => {
        return next(err);
      });
};

module.exports = {
  transferCash: transferCash
};
