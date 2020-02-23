'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const moment = require('moment');
const bills = require('../models/Bills')();
const cities = require('../models/Cities')();
const accounts = require('../models/Accounts')();
const transactions = require('../models/Transactions')();
const sequences = require('../models/Sequences')();
const fmt = require('../config/formats');
const cu = require('../utils/common-utils');

// it does not have a callback or does not need to return a promise.
const execute = function (parms) {
  const stats = {closed: 0, opened: 0};
  let city = null;

  cities.findDefault(parms.db).then((ct) => {
    city = ct;
    return closeBills(parms, city, stats);
  }).then(() => {
    return createNewBills(parms, city, stats);
  }).then(() => {
    parms.log.info('BillCloser :: ' + JSON.stringify(stats));
  }).catch((err) => {
    cu.logErr(parms.log, err);
  });
};

// step 2: close all open bills.
const closeBills = function (parms, city, stats) {
  return new Promise(function (resolve, reject) {
    const promises = [];

    bills.findForCityOpen(parms.db, city.id).then((bills) => {
      bills.forEach(function (bill) {
        // close only if the billDt is in the past.
        if(moment().isAfter(bill.billDt, 'day')) {
          promises.push(closeEachBill(parms, bill));
        }
      });
      if(!promises.length) {
        return resolve();
      } else {
        Promise.all(promises).then(() => {
          stats.closed = promises.length;
          return resolve();
        }).catch((err) => {
          return reject(err);
        });
      }
    }).catch((err) => {
      return reject(err);
    });
  });
};

// step 2.2: close each bill.
const closeEachBill = function (parms, b) {
  return new Promise(function (resolve, reject) {
    let amt = 0;

    transactions.findForAcct(parms.db, b.cityId, b.account.id, b.id).then((trans) => {
      trans.forEach(function (tr) {
        amt += tr.amount;
      });
      amt = _.round(amt, 2);
      return accounts.findById(parms.db, b.account.id);
    }).then((acct) => {
      b.amount = acct.cash ? amt * -1 : amt;
      return bills.update(parms.db, {id: b.id}, {$set: {amount: b.amount, balance: b.amount,
        closed: true}});
    }).then(() => {
      return accounts.update(parms.db, {id: b.account.id}, {$set: {'bills.last': {id: b.id, name: b.name}}});
    }).then(() => {
      return resolve();
    }).catch((err) => {
      return reject(err);
    });
  });
};

// step 3: create new open bills.
const createNewBills = function (parms, city, stats) {
  return new Promise(function (resolve, reject) {
    const promises = [];

    accounts.findBillable(parms.db, city.id).then((accts) => {
      accts.forEach(function (acct) {
        promises.push(createEachBill(parms, city, acct, stats));
      });
      if(!promises.length) {
        return resolve();
      } else {
        Promise.all(promises).then(() => {
          return resolve();
        }).catch((err) => {
          return reject(err);
        });
      }
    }).catch((err) => {
      return reject(err);
    });
  });
};

// step 3.3: create a new OpenBill..
const createEachBill = function (parms, city, ac, stats) {
  return new Promise(function (resolve, reject) {
    let b = null;
    // use default id of -1, if the bill obj is null.
    const billId = (ac.bills && ac.bills.open) ? ac.bills.open.id : -1;

    bills.findById(parms.db, billId).then((bill) => {
      if(!isNewBillNeeded(ac, bill)) {
        return resolve();
      } else {
        sequences.getNextSeq(parms.db, {table: 'bills', cityId: city.id}).then((seq) => {
          return buildEmptyBill(city, ac, seq.seq);
        }).then((bill) => {
          b = bill;
          return bills.insert(parms.db, bill);
        }).then(() => {
          return accounts.update(parms.db, {id: b.account.id}, {$set: {'bills.open': {id: b.id, name: b.name}}});
        }).then(() => {
          stats.opened += 1;
          return resolve();
        }).catch((err) => {
          return reject(err);
        });
      }
    }).catch((err) => {
      return reject(err);
    });
  });
};

// step 3.2: check if new bill is needed..
const isNewBillNeeded = function (ac, bill) {
  if(!ac.billed) {
      // if the account is not billed, new bill NOT needed.
    return false;
  } else if(!ac.bills.open || !bill) {
      // if the 'openbill' on the account is null, new bill IS needed.
    return true;
  } else if(bill.closed) {
      // if the 'openbill' on the account is not closed, new bill IS needed.
    return true;
  } else {
    return false;
  }
};

// step 3.3.1: build an empty bill..
const buildEmptyBill = function (city, ac, seq) {
  return new Promise(function (resolve) {
    let dueDt = null;
    let billDt = moment().date(ac.closingDay);

    // if billDt is in the past, add 1 month.
    billDt = moment().isAfter(billDt, 'day') ? billDt.add(1, 'month') : billDt;
    dueDt = billDt.clone().date(ac.dueDay);
    // if dueDt is lesser than billDt, add 1 month.
    dueDt = billDt.isAfter(dueDt, 'day') ? dueDt.add(1, 'month') : dueDt;

    const bill = {
      id: seq,
      cityId: city.id,
      account: {id: ac.id, name: ac.name},
      createdDt: moment().format(fmt.YYYYMMDDHHmmss),
      billDt: billDt.format(fmt.YYYYMMDD),
      dueDt: dueDt.format(fmt.YYYYMMDD),
      closed: false,
      amount: 0,
      balance: 0
    };

    bill.name = bills.getName(bill.account, bill);
    return resolve(bill);
  });
};

module.exports = {
  execute: execute,
};
