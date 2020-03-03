'use strict';

import _ from 'lodash';

import { accounts, categories, cities, transactions } from '../models';

import { buildMonthsList } from '../utils/month-utils';
import { sendJson, sendJsonEmbedNull } from '../utils/common-utils';
import config from '../config/config';

// TODO: move the db logic to service
export const canConnect = (req, resp) => {
  if (!req.app.locals.db) {
    req.app.locals.log.info('DB connection not available...  DB URL :: ' + config.dburl);
    return resp.json({ code: config.error });
  }
  accounts
    .findById(req.app.locals.db, 0)
    .then(() => {
      return resp.json({ code: 0, data: { env: config.env } });
    })
    .catch(err => {
      req.app.locals.log.error(err);
      return resp.json({ code: config.error });
    });
};

export const getAllCities = (req, resp) => {
  const promise = cities.findAllCities(req.app.locals.db);
  return sendJson(promise, resp, req.app.locals.log);
};

export const getDefaultCity = (req, resp) => {
  const promise = cities.findDefault(req.app.locals.db);
  return sendJson(promise, resp, req.app.locals.log);
};

export const getCityById = (req, resp, cityId) => {
  const promise = cities.findById(req.app.locals.db, cityId);
  return sendJson(promise, resp, req.app.locals.log);
};

export const getAccounts = (req, resp) => {
  const promise = accounts.findForCity(req.app.locals.db, _.toNumber(req.query.cityId));
  return sendJson(promise, resp, req.app.locals.log);
};

export const getAccountsThin = (req, resp) => {
  const promise = accounts.findForCityThin(req.app.locals.db, _.toNumber(req.query.cityId));
  return sendJsonEmbedNull(promise, resp, req.app.locals.log);
};

export const getCategories = (req, resp) => {
  const promise = categories.findForCity(req.app.locals.db, _.toNumber(req.query.cityId));
  return sendJsonEmbedNull(promise, resp, req.app.locals.log);
};

export const getDescriptions = (req, resp) => {
  transactions
    .findAllDescriptions(req.app.locals.db, _.toNumber(req.query.cityId))
    .then(docs => {
      const descriptions = docs.map(a => ({ name: a['_id'], bills: null }));
      return resp.json({ code: 0, data: descriptions });
    })
    .catch(err => {
      req.app.locals.log.error(err);
      return resp.json({ code: config.error });
    });
};

export const getEntryMonths = (req, resp) => {
  const promise = transactions.findAllEntryMonths(req.app.locals.db, _.toNumber(req.query.cityId));
  return sendMonthsList(promise, resp, req.app.locals.log);
};

export const getTransMonths = (req, resp) => {
  const promise = transactions.findAllTransMonths(req.app.locals.db, _.toNumber(req.query.cityId));
  return sendMonthsList(promise, resp, req.app.locals.log);
};

// utility method.
const sendMonthsList = (promise, resp, log) => {
  promise
    .then(docs => {
      return buildMonthsList(docs, log);
    })
    .then(months => {
      return resp.json({ code: 0, data: months });
    })
    .catch(err => {
      log.error(err);
      return resp.json({ code: config.error });
    });
};
