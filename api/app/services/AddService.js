'use strict';

const Promise = require('bluebird');
const moment = require('moment');
const numeral = require('numeral');
const sugar = require('sugar/string');
const accounts = require('../models/Accounts')();
const bills = require('../models/Bills')();
const transactions = require('../models/Transactions')();
const sequences = require('../models/Sequences')();
const cashService = require('./CashService');
const fmt = require('../config/formats');
const cu = require('../utils/common-utils');

const addExpense = function (parms, data, next) {
  addExpensePromise(parms, data).then((tr) => {
    return next(null, tr);
  }).catch((err) => {
    return next(err);
  });
};

const addExpensePromise = function (parms, data) {
  return new Promise(function (resolve, reject) {
    let tr = null;

    cu.checkCityEditable(parms.db, data.city.id).then(() => {
      return getAccountsInfo(parms, data);
    }).then(() => {
      return copyTransData(data);
    }).then((trans) => {
      tr = trans;
      return copyAccountsData(data, tr);
    }).then(() => {
      return sequences.getNextSeq(parms.db, {table: 'transactions', cityId: data.city.id});
    }).then((seq) => {
      tr.id = seq.seq;
      tr.seq = seq.seq;
      return transactions.insert(parms.db, tr);
    }).then(() => {
      return cashService.transferCash({db: parms.db, from: data.accounts.from,
        to: data.accounts.to, amount: tr.amount, seq: 0});
    }).then(() => {
    // re-fetch from DB to get the revised balances after cash transfer
      return getAccountsInfo(parms, data);
    }).then(() => {
      return transactions.update(parms.db, {id: tr.id}, {$set: {'accounts.from.balanceAf': data.accounts.from.balance,
        'accounts.to.balanceAf': data.accounts.to.balance}});
    }).then(() => {
      return resolve(tr);
    }).catch((err) => {
      cu.logErr(parms.log, err);
      return reject(err);
    });
  });
};

// step 3: fetch from & to accounts info from DB
const getAccountsInfo = function (parms, data) {
  return new Promise(function (resolve, reject) {
    const promises = [];

    promises.push(accounts.findById(parms.db, data.accounts.from ? data.accounts.from.id: 0));
    promises.push(accounts.findById(parms.db, data.accounts.to ? data.accounts.to.id: 0));
    Promise.all(promises).then((accounts) => {
      data.accounts.from = accounts[0];
      data.accounts.to = accounts[1];
      return resolve();
    }).catch((err) => {
      return reject(err);
    });
  });
};

// setp 2: copy transaction data from input to transaction record.
const copyTransData = function (data) {
  return new Promise(function (resolve) {
    const trans = {
      id: 0,
      cityId: data.city.id,
      entryDt: moment().format(fmt.YYYYMMDDHHmmss),
      entryMonth: moment().date(1).format(fmt.YYYYMMDD),
      category: {id: 0, name: ' ~ '},
      description: sugar.String(data.description.name || data.description).capitalize(false, true).raw,
      amount: numeral(data.amount).value(),
      transDt: moment(data.transDt, fmt.DDMMMYYYY).format(fmt.YYYYMMDD),
      transMonth: moment(data.transDt, fmt.DDMMMYYYY).date(1).format(fmt.YYYYMMDD),
      seq: 0,
      accounts: {
        from: {id: 0, name: '', balanceBf: 0, balanceAf: 0},
        to: {id: 0, name: '', balanceBf: 0, balanceAf: 0}
      },
      adhoc: data.adhoc,
      adjust: data.adjust,
      status: true,
      tallied: false,
      tallyDt: null
    };

    if(data.category) {
      trans.category.id = data.category.id;
      trans.category.name = data.category.name;
    }
    return resolve(trans);
  });
};

// setp 3: copy accounts data from input to transaction record.
const copyAccountsData = function (data, trans) {
  return new Promise(function (resolve) {
    const from = data.accounts.from;
    const to = data.accounts.to;

    if(from.id) {
      trans.accounts.from = {id: from.id, name: from.name, balanceBf: from.balance, balanceAf: from.balance};
      if(from.billed && from.bills && from.bills.open) {
        trans.bill = {id: from.bills.open.id, account: {id: from.id, name: from.name}, billDt: from.bills.open.billDt};
        trans.bill.name = bills.getName(from, trans.bill);
      }
    }
    if(to.id) {
      trans.accounts.to = {id: to.id, name: to.name, balanceBf: to.balance, balanceAf: to.balance};
    }
    return resolve();
  });
};

module.exports = {
  addExpense: addExpense,
  addExpensePromise: addExpensePromise
};
