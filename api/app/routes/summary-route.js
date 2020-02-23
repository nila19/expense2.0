'use strict';

const express = require('express');
const router = express.Router();
const error = require('./error-route');
const summary = require('../controllers/SummaryController');

router.use(function (req, res, next) {
  res.locals.authenticated = true;
  next();
});

router.all('*', function (req, res, next) {
  next();
});

router.get('/go', function (req, res, next) {
  summary.doSummary(req, res);
});

router.get('/chart', function (req, res, next) {
  summary.doChart(req, res);
});

router.use(error.inject404());

module.exports = router;
