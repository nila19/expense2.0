'use strict';

const tallyservice = require('../services/TallyService');
const addservice = require('../services/AddService');
const deleteservice = require('../services/DeleteService');
const modifyservice = require('../services/ModifyService');
const billpayservice = require('../services/BillPayService');
const swapservice = require('../services/SwapService');
const cu = require('../utils/common-utils');
const config = require('../config/config');

const tallyAccount = function (req, resp, acctId) {
  const parms = cu.buildParm(req);

  parms.acctId = acctId;
  tallyservice.tally(parms, function (err) {
    return err ? resp.json({code: config.error, msg: err.message}) : resp.json({code: 0});
  });
};

const addExpense = function (req, resp) {
  addservice.addExpense(cu.buildParm(req), req.body, function (err, trans) {
    return err ? resp.json({code: config.error, msg: err.message}) : resp.json({code: 0, data: trans});
  });
};

const modifyExpense = function (req, resp) {
  modifyservice.modifyExpense(cu.buildParm(req), req.body, function (err) {
    return err ? resp.json({code: config.error, msg: err.message}) : resp.json({code: 0});
  });
};

const deleteExpense = function (req, resp, transId) {
  const parms = cu.buildParm(req);

  parms.transId = transId;
  deleteservice.deleteExpense(parms, function (err) {
    return err ? resp.json({code: config.error, msg: err.message}) : resp.json({code: 0});
  });
};

const swapExpenses = function (req, resp) {
  swapservice.swapExpenses(cu.buildParm(req), req.body, function (err) {
    return err ? resp.json({code: config.error, msg: err.message}) : resp.json({code: 0});
  });
};

const payBill = function (req, resp) {
  billpayservice.payBill(cu.buildParm(req), req.body, function (err, trans) {
    return err ? resp.json({code: config.error, msg: err.message}) : resp.json({code: 0, data: trans});
  });
};

module.exports = {
  tallyAccount: tallyAccount,
  addExpense: addExpense,
  modifyExpense: modifyExpense,
  deleteExpense: deleteExpense,
  swapExpenses: swapExpenses,
  payBill: payBill,
};
