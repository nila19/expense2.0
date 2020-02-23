'use strict';

const Promise = require('bluebird');
const accounts = require('../models/Accounts')();
const bills = require('../models/Bills')();
const transactions = require('../models/Transactions')();
const cashService = require('./CashService');
const cu = require('../utils/common-utils');

const deleteExpense = function (parms, next) {
  let tr = null;
  let accts = null;

  transactions.findById(parms.db, parms.transId).then((trans) => {
    tr = trans;
    return cu.checkCityEditable(parms.db, tr.cityId);
  }).then(() => {
    return getAccountsInfo(parms, tr);
  }).then((accounts) => {
    accts = accounts;
    return cu.checkAccountsActive(true, accts.from, accts.to);
  }).then(() => {
    // reverse the from / to accounts to reverse cash.
    return cashService.transferCash({db: parms.db, from: accts.to, to: accts.from,
      amount: tr.amount, seq: tr.seq});
  }).then(() => {
    return modifyBillBalance(parms, tr);
  }).then(() => {
    return transactions.remove(parms.db, {id: parms.transId});
  }).then(() => {
    return next();
  }).catch((err) => {
    cu.logErr(parms.log, err);
    return next(err);
  });
};

// step 3: fetch from & to accounts info from DB
const getAccountsInfo = function (parms, tr) {
  return new Promise(function (resolve, reject) {
    const accts = {from: {id: 0, balance: 0}, to: {id: 0, balance: 0}};
    const promises = [];

    promises.push(accounts.findById(parms.db, tr.accounts.from.id));
    promises.push(accounts.findById(parms.db, tr.accounts.to.id));
    Promise.all(promises).then((accounts) => {
      accts.from = accounts[0];
      accts.to = accounts[1];
      return resolve(accts);
    }).catch((err) => {
      return reject(err);
    });
  });
};

// step 4: if the expense has been included in a bill, deduct the bill amount & balance.
const modifyBillBalance = function (parms, tr) {
  return new Promise(function (resolve, reject) {
    if(!tr.bill) {
      return resolve();
    }

    bills.findOneAndUpdate(parms.db, {id: tr.bill.id}, {$inc: {amount: -tr.amount, balance: -tr.amount}}).then(() => {
      return resolve();
    }).catch((err) => {
      return reject(err);
    });
  });
};

module.exports = {
  deleteExpense: deleteExpense,
};
