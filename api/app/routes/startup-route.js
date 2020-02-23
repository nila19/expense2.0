'use strict';

const _ = require('lodash');
const express = require('express');
const router = express.Router();
const error = require('./error-route');
const startup = require('../controllers/StartupController');

router.use(function (req, res, next) {
  res.locals.authenticated = true;
  next();
});

router.all('*', function (req, res, next) {
  next();
});

router.get('/connect', function (req, res, next) {
  startup.canConnect(req, res);
});

router.get('/cities', function (req, res, next) {
  startup.getAllCities(req, res);
});

router.get('/city/default', function (req, res, next) {
  startup.getDefaultCity(req, res);
});

router.get('/city/:cityId', function (req, res, next) {
  startup.getCityById(req, res, _.toNumber(req.params.cityId));
});

router.get('/accounts', function (req, res, next) {
  startup.getAccounts(req, res);
});

router.get('/accounts/thin', function (req, res, next) {
  startup.getAccountsThin(req, res);
});

router.get('/categories', function (req, res, next) {
  startup.getCategories(req, res);
});

router.get('/descriptions', function (req, res, next) {
  startup.getDescriptions(req, res);
});

router.get('/months/entry', function (req, res, next) {
  startup.getEntryMonths(req, res);
});

router.get('/months/trans', function (req, res, next) {
  startup.getTransMonths(req, res);
});

router.use(error.inject404());

module.exports = router;
