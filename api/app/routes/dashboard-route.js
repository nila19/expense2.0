'use strict';

const numeral = require('numeral');
const express = require('express');
const router = express.Router();
const error = require('./error-route');
const dashboard = require('../controllers/DashboardController');

router.use(function (req, res, next) {
  res.locals.authenticated = true;
  next();
});

router.all('*', function (req, res, next) {
  next();
});

router.get('/transaction/:transId', function (req, res, next) {
  dashboard.getTransactionById(req, res, numeral(req.params.transId).value());
});

router.get('/bills', function (req, res, next) {
  dashboard.getBills(req, res);
});

router.get('/bill/:billId', function (req, res, next) {
  dashboard.getBillById(req, res, numeral(req.params.billId).value());
});

router.get('/account/:acctId', function (req, res, next) {
  dashboard.getAccountById(req, res, numeral(req.params.acctId).value());
});

router.use(error.inject404());

module.exports = router;
