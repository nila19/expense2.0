'use strict';

const moment = require('moment');
const async = require('async');
const accounts = require('../models/Accounts')();
const transactions = require('../models/Transactions')();
const tallyhistories = require('../models/TallyHistories')();
const sequences = require('../models/Sequences')();
const cu = require('../utils/common-utils');
const fmt = require('../config/formats');

const tally = function (parms, next) {
  const tallyDt = moment().format(fmt.YYYYMMDDHHmmss);
  let ac = null;

  accounts.findById(parms.db, parms.acctId).then((account) => {
    ac = account;
    return cu.checkCityEditable(parms.db, ac.cityId);
  }).then(() => {
    return accounts.update(parms.db, {id: ac.id}, {$set: {tallyBalance: ac.balance, tallyDt: tallyDt}});
  }).then(() => {
    return sequences.getNextSeq(parms.db, {table: 'tallyhistories', cityId: ac.cityId});
  }).then((seq) => {
    return tallyhistories.insert(parms.db, buildTallyHistory(seq, ac, tallyDt));
  }).then(() => {
    return transactions.findForAcct(parms.db, ac.cityId, ac.id);
  }).then((trans) => {
    async.each(trans, function (tran, cb) {
      return updateTran(parms.db, tran, tallyDt, cb);
    });
  }).then(() => {
    return next();
  }).catch((err) => {
    cu.logErr(parms.log, err);
    return next(err);
  });
};

const buildTallyHistory = function (seq, ac, tallyDt) {
  return {
    id: seq.seq,
    account: {id: ac.id, name: ac.name},
    cityId: ac.cityId,
    tallyDt: tallyDt,
    balance: ac.balance
  };
};

const updateTran = function (db, tran, tallyDt, next) {
  if(tran.tallied) {
    return next();
  }
  transactions.update(db, {id: tran.id}, {$set: {tallied: true, tallyDt: tallyDt}}).then(() => {
    return next();
  }).catch((err) => {
    return next(err);
  });
};

module.exports = {
  tally: tally,
};
