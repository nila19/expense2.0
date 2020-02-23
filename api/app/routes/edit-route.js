'use strict';

const _ = require('lodash');
const express = require('express');
const router = express.Router();
const error = require('./error-route');
const edit = require('../controllers/EditController');

router.use(function (req, res, next) {
  res.locals.authenticated = true;
  next();
});

router.all('*', function (req, res, next) {
  next();
});

router.post('/tally/:acctId', function (req, res, next) {
  edit.tallyAccount(req, res, _.toNumber(req.params.acctId));
});

router.post('/add', function (req, res, next) {
  edit.addExpense(req, res);
});

router.post('/modify', function (req, res, next) {
  edit.modifyExpense(req, res);
});

router.post('/delete/:transId', function (req, res, next) {
  edit.deleteExpense(req, res, _.toNumber(req.params.transId));
});

router.post('/swap/:cityId', function (req, res, next) {
  edit.swapExpenses(req, res, _.toNumber(req.params.cityId));
});

router.post('/paybill', function (req, res, next) {
  edit.payBill(req, res);
});

router.use(error.inject404());

module.exports = router;
