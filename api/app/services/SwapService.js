'use strict';

const async = require('async');
const Promise = require('bluebird');
const accounts = require('../models/Accounts')();
const transactions = require('../models/Transactions')();
const cu = require('../utils/common-utils');

const swapExpenses = function (parms, data, next) {
  async.each(data, function (item, cb) {
    processSwapRow(parms, item.fromTrans, item.toTrans, function (err) {
      return cb(err);
    });
  }, function (err) {
    cu.logErr(parms.log, err);
    return next(err);
  });
};

//* *************************************************//
// setp 3: processes each swap row.
const processSwapRow = function (parms, one, two, next) {
  const trans = {first: {id: 0}, second: {id: 0}};
  const accts = {};
  const balances = {};

  Promise.all([getTrans(parms, accts, balances, one), getTrans(parms, accts, balances, two)]).then((trs) => {
    trans.first = trs[0];
    trans.second = trs[1];
  }).then(() => {
    return cu.checkCityEditable(parms.db, trans.first.cityId);
  }).then(() => {
    return adjustAccountsSeq(trans);
  }).then(() => {
    return initializeBalances(trans, balances);
  }).then(() => {
    return replayTransactions(trans, accts, balances);
  }).then(() => {
    return updateTransactions(parms, trans);
  }).then(() => {
    return next();
  }).catch((err) => {
    return next(err);
  });
};

const getTrans = function (parms, accts, balances, id) {
  return new Promise(function (resolve, reject) {
    let tr = null;

    transactions.findById(parms.db, id).then((tran) => {
      tr = tran;
      const promises = [];

      promises.push(accounts.findById(parms.db, tran.accounts.from.id));
      promises.push(accounts.findById(parms.db, tran.accounts.to.id));
      return Promise.all(promises);
    }).then((accounts) => {
      accounts.forEach(function (ac) {
        accts[ac.id] = ac;
        balances[ac.id] = 0;
      });
      return resolve(tr);
    }).catch((err) => {
      return reject(err);
    });
  });
};

// step 3.3: check seq of the 2 accounts & find out which is older.
const adjustAccountsSeq = function (trans) {
  return new Promise(function (resolve) {
    let tran = null;
    let seq = 0;

    // oldest (the one with smaller seq) should be first.
    if(trans.second.seq < trans.first.seq) {
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
const initializeBalances = function (trans, balances) {
  return new Promise(function (resolve) {
  // process in reverse chronological order. newest first.
    balances[trans.second.accounts.from.id] = trans.second.accounts.from.balanceBf;
    balances[trans.second.accounts.to.id] = trans.second.accounts.to.balanceBf;
    balances[trans.first.accounts.from.id] = trans.first.accounts.from.balanceBf;
    balances[trans.first.accounts.to.id] = trans.first.accounts.to.balanceBf;
    return resolve();
  });
};

// step 3.6: replay the transactions in the new order & update the account balances.
const replayTransactions = function (trans, accts, balances) {
  return new Promise(function (resolve) {
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
const replayTran = function (accts, balances, tr) {
  balances[tr.accounts.from.id] -= accts[tr.accounts.from.id].cash ? tr.amount : tr.amount * -1;
  balances[tr.accounts.to.id] += accts[tr.accounts.to.id].cash ? tr.amount : tr.amount * -1;
};

const updateTransactions = function (parms, trans) {
  return new Promise(function (resolve, reject) {
    const promises = [];

    buildUpdatePromises(parms, trans.first, promises);
    buildUpdatePromises(parms, trans.second, promises);
    Promise.all(promises).then(() => {
      return resolve();
    }).catch((err) => {
      return reject(err);
    });
  });
};

const buildUpdatePromises = function (parms, tr, prs) {
  if(!tr.accounts.from.id) {
    prs.push(transactions.update(parms.db, {id: tr.id}, {$set: {'accounts.from.balanceBf': tr.accounts.from.balanceBf,
      'accounts.from.balanceAf': tr.accounts.from.balanceAf, seq: tr.seq}}));
  }
  if(!tr.accounts.to.id) {
    prs.push(transactions.update(parms.db, {id: tr.id}, {$set: {'accounts.to.balanceBf': tr.accounts.to.balanceBf,
      'accounts.to.balanceAf': tr.accounts.to.balanceAf, seq: tr.seq}}));
  }
};

module.exports = {
  swapExpenses: swapExpenses,
};
