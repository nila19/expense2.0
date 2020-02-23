'use strict';

const _ = require('lodash');
const accounts = require('../models/Accounts')();
const cities = require('../models/Cities')();
const categories = require('../models/Categories')();
const transactions = require('../models/Transactions')();
const monthUtils = require('../utils/month-utils');
const cu = require('../utils/common-utils');
const config = require('../config/config');

const canConnect = function (req, resp) {
  if(!req.app.locals.db) {
    req.app.locals.log.info('DB connection not available...  DB URL :: ' + config.dburl);
    return resp.json({code: config.error});
  }

  accounts.findById(req.app.locals.db, 0).then(() => {
    return resp.json({code: 0, data: {env: config.env}});
  }).catch((err) => {
    req.app.locals.log.error(err);
    return resp.json({code: config.error});
  });
};

// **************************** city ****************************//
const getAllCities = function (req, resp) {
  const promise = cities.findAllCities(req.app.locals.db);

  return cu.sendJson(promise, resp, req.app.locals.log);
};
const getDefaultCity = function (req, resp) {
  const promise = cities.findDefault(req.app.locals.db);

  return cu.sendJson(promise, resp, req.app.locals.log);
};
const getCityById = function (req, resp, cityId) {
  const promise = cities.findById(req.app.locals.db, cityId);

  return cu.sendJson(promise, resp, req.app.locals.log);
};

// **************************** account ****************************//
const getAccounts = function (req, resp) {
  const promise = accounts.findForCity(req.app.locals.db, _.toNumber(req.query.cityId));

  return cu.sendJson(promise, resp, req.app.locals.log);
};
const getAccountsThin = function (req, resp) {
  const promise = accounts.findForCityThin(req.app.locals.db, _.toNumber(req.query.cityId));

  return cu.sendJsonEmbedNull(promise, resp, req.app.locals.log);
};

// **************************** categories ****************************//
const getCategories = function (req, resp) {
  const promise = categories.findForCity(req.app.locals.db, _.toNumber(req.query.cityId));

  return cu.sendJsonEmbedNull(promise, resp, req.app.locals.log);
};

// **************************** description ****************************//
const getDescriptions = function (req, resp) {
  transactions.findAllDescriptions(req.app.locals.db, _.toNumber(req.query.cityId)).then((docs) => {
    const desc = docs.map(function (a) {
      return {name: a['_id'], bills: null};
    });

    return resp.json({code: 0, data: desc});
  }).catch((err) => {
    req.app.locals.log.error(err);
    return resp.json({code: config.error});
  });
};

// **************************** months ****************************//
const getEntryMonths = function (req, resp) {
  const promise = transactions.findAllEntryMonths(req.app.locals.db, _.toNumber(req.query.cityId));

  return sendMonthsList(promise, resp, req.app.locals.log);
};

const getTransMonths = function (req, resp) {
  const promise = transactions.findAllTransMonths(req.app.locals.db, _.toNumber(req.query.cityId));

  return sendMonthsList(promise, resp, req.app.locals.log);
};

// utility method.
const sendMonthsList = function (promise, resp, log) {
  promise.then((docs) => {
    return monthUtils.buildMonthsList(docs, log);
  }).then((months) => {
    return resp.json({code: 0, data: months});
  }).catch((err) => {
    log.error(err);
    return resp.json({code: config.error});
  });
};

module.exports = {
  canConnect: canConnect,
  getAllCities: getAllCities,
  getDefaultCity: getDefaultCity,
  getCityById: getCityById,
  getAccounts: getAccounts,
  getAccountsThin: getAccountsThin,
  getCategories: getCategories,
  getDescriptions: getDescriptions,
  getEntryMonths: getEntryMonths,
  getTransMonths: getTransMonths
};
