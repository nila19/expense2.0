'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const addservice = require('./AddService');
const bills = require('../models/Bills')();
const cu = require('../utils/common-utils');

const payBill = function (parms, data, next) {
  let tr = null;

  cu.checkCityEditable(parms.db, data.city.id).then(() => {
    return buildTransInput(data);
  }).then((input) => {
    return addservice.addExpensePromise(parms, input);
  }).then((trans) => {
    tr = trans;
    return updateBill(parms, data, trans);
  }).then(() => {
    return next(null, tr);
  }).catch((err) => {
    cu.logErr(parms.log, err);
    return next(err);
  });
};

// setp 2: copy transaction data from input to transaction record.
const buildTransInput = function (data) {
  return new Promise(function (resolve) {
    const input = {
      city: data.city,
      accounts: {from: data.account, to: data.bill.account},
      category: null,
      description: 'CC Bill Payment',
      amount: _.toNumber(data.paidAmt),
      transDt: data.paidDt,
      adhoc: false,
      adjust: true
    };

    return resolve(input);
  });
};
// step 5 : save transaction to DB
const updateBill = function (parms, data, trans) {
  return new Promise(function (resolve, reject) {
    const pmt = {id: trans.id, transDt: trans.transDt, amount: trans.amount};
    let bal = data.bill.balance - trans.amount;

    bal = (bal > -0.01 && bal < 0.01) ? 0 : bal;
    bills.update(parms.db, {id: data.bill.id}, {$set: {balance: bal}, $push: {payments: pmt}}).then(() => {
      return resolve();
    }).catch((err) => {
      return reject(err);
    });
  });
};

module.exports = {
  payBill: payBill,
};
