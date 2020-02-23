'use strict';

const _ = require('lodash');
const accounts = require('../models/Accounts')();
const bills = require('../models/Bills')();
const transactions = require('../models/Transactions')();
const cu = require('../utils/common-utils');

// **************************** transactions ****************************//
const getTransactionById = function (req, resp, transId) {
  const promise = transactions.findById(req.app.locals.db, transId);

  return cu.sendJson(promise, resp, req.app.locals.log);
};

// **************************** bills ****************************//
const getBills = function (req, resp) {
  const p = {
    db: req.app.locals.db,
    id: req.query.acctId ? _.toNumber(req.query.acctId) : _.toNumber(req.query.cityId),
    paid: req.query.paidInd
  };
  const promise = req.query.acctId ? bills.findForAcct(p.db, p.id, p.paid) : bills.findForCity(p.db, p.id, p.paid);

  return cu.sendJson(promise, resp, req.app.locals.log);
};
const getBillById = function (req, resp, billId) {
  const promise = bills.findById(req.app.locals.db, billId);

  return cu.sendJson(promise, resp, req.app.locals.log);
};

// **************************** account ****************************//
const getAccountById = function (req, resp, acctId) {
  const promise = accounts.findById(req.app.locals.db, acctId);

  return cu.sendJson(promise, resp, req.app.locals.log);
};

module.exports = {
  getTransactionById: getTransactionById,
  getBills: getBills,
  getBillById: getBillById,
  getAccountById: getAccountById,
};
