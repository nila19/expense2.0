/* eslint no-magic-numbers: "off", no-unused-vars: "off" */

const dt = require('moment');
const sugar = require('sugar/string');
const numeral = require('numeral');
const _ = require('lodash/string');

const mongo = require('../config/mongodb-config');
const log = require('../utils/logger');
const accounts = require('../models/Accounts')();
const trans = require('../models/Transactions')();
const bills = require('../models/Bills')();
const monthUtils = require('../utils/month-utils');
const billcloser = require('../services/BillCloserService');
const argv = require('minimist')(process.argv.slice(2));

const queryTrans = function (mongo, log, next) {
  log.info('Query transactions started...');
  // const filter = {acctId: 60, cityId: 20140301, adjust: 'Y', description: 'paym', thinList: true};
  // bills.find(mongo, {acctId: 81, 'payments.amount': {$gt: 500}}).then((docs) => {
  // trans.findForSearch(mongo, filter).then((docs) => {
  trans.findForAcctbySeq(mongo, 20140301, 68, 5840).then((doc) => {
    log.info('************** TEST **************...');
    log.info(JSON.stringify(doc));
    // docs.forEach(function (row) {
    //   // log.info('DATES :: ' + dt(row).format());
    //   log.info(JSON.stringify(row) + ' :: ' + dt(row.entryMonth).format());
    // });
    log.info('************** DONE TEST **************...');
    return next();
  }).catch((err) => {
    log.error(err);
    return next();
  });
};

const queryBills = function (mongo, log, next) {
  bills.find(mongo, {id: 98}).then((docs) => {
    log.info('************** TEST **************...');
    docs.forEach(function (row) {
      log.info(JSON.stringify(row));
    });
    log.info('************** DONE TEST **************...');
    return next();
  }).catch((err) => {
    log.error(err);
    return next();
  });
};

const queryAccount = function (mongo, log, next) {
  accounts.findForCityActive(mongo, 20140301).then((docs) => {
    log.info('************** TEST **************...');
    docs.forEach(function (row) {
      log.info(JSON.stringify(row));
    });
    log.info('************** DONE TEST **************...');
    return next();
  }).catch((err) => {
    log.error(err);
    return next();
  });
};

const queryTran = function (mongo, log, next) {
  trans.find(mongo, {'bill.id': 98}, {fields: {_id: 0, amount: 1}}).then((docs) => {
    log.info('************** TEST **************...');
    docs.forEach(function (row) {
      log.info(JSON.stringify(row));
    });
    log.info('************** DONE TEST **************...');
    return next();
  }).catch((err) => {
    log.error(err);
    return next();
  });
};

const getTransMonths = function (mongo, log, next) {
  trans.findAllTransMonths(mongo, 20140301).then((docs) => {
    monthUtils.buildMonthsList(docs, log, function (err, dates) {
      if(err) {
        log.error(err);
      } else {
        log.info('************** TEST **************...');
        dates.forEach(function (row) {
          log.info(JSON.stringify(row));
        });
        log.info('************** DONE TEST **************...');
      }
      return next(err);
    });
  }).catch((err) => {
    log.error(err);
  });
};

const closer = function () {
  mongo.connect(log, function (mongo) {
    billcloser.execute({db: mongo, log: log}, function (err) {
      if(err) {
        log.error(err);
      }
      mongo.close();
    });
  });
};

// debugger;
const query = function () {
  mongo.connect(log, function (mongo) {
    queryAccount(mongo, log, function (err) {
    // queryTrans(mongo, log, function (err) {
    // getTransMonths(mongo, log, function (err) {
      if(err) {
        log.error(err);
      }
      mongo.close();
    });
  });
};

const bal1 = 463.0700000000001;
  // const bal2 = 3237.7799999999997;
const obj = {
  value: numeral(bal1).value(),
  format: numeral(bal1).format('0.00'),
  final: numeral(numeral(bal1).format('0.00')).value()
};

const test = function () {
  mongo.connect(log, function (mongo) {
    log.info('MAIN PARMS = ' + JSON.stringify(argv));
    mongo.close();
  });
};

const msg = 'someone sAid somEThing SOMEWHERE.. also nothing..';

log.info('Sugarized =' + sugar.String(msg).capitalize(false, true).raw + '::');
log.info('lodashed =' + _.startCase(msg) + '::');

// test();

// log.info(JSON.stringify(obj));
// closer();
// query();
// const tally2 = dt().subtract(4, 'hours');
// log.info(tally2.valueOf() + ' - ' + dt().isSame(tally2, 'day'));
