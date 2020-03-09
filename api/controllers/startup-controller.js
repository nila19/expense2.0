'use strict';

import _ from 'lodash';

import { accounts, categories, cities, transactions } from '../models';

import { buildMonthsList } from '../utils/month-utils';
import config from '../config/config';

export const doConnect = async (req, resp) => {
  if (!req.app.locals.db) {
    req.app.locals.log.info('DB connection not available...  DB URL :: ' + config.dburl);
    return resp.json({ code: config.error });
  }
  await accounts.findById(req.app.locals.db, 0);
  return resp.json({ code: 0, data: { env: config.env } });
};

export const getAllCities = async (req, resp) => {
  const data = await cities.findAllCities(req.app.locals.db);
  return resp.json({ code: 0, data: data });
};

export const getDefaultCity = async (req, resp) => {
  const data = await cities.findDefault(req.app.locals.db);
  return resp.json({ code: 0, data: data });
};

export const getCityById = async (req, resp, cityId) => {
  const data = await cities.findById(req.app.locals.db, cityId);
  return resp.json({ code: 0, data: data });
};

export const getAccounts = async (req, resp) => {
  const data = await accounts.findForCity(req.app.locals.db, getCityId(req));
  return resp.json({ code: 0, data: data });
};

export const getAccountsThin = async (req, resp) => {
  const data = await accounts.findForCityThin(req.app.locals.db, getCityId(req));
  data.forEach(datum => (datum.bills = null));
  return resp.json({ code: 0, data: data });
};

export const getCategories = async (req, resp) => {
  const data = await categories.findForCity(req.app.locals.db, getCityId(req));
  data.forEach(datum => (datum.bills = null));
  return resp.json({ code: 0, data: data });
};

export const getDescriptions = async (req, resp) => {
  const data = await transactions.findAllDescriptions(req.app.locals.db, getCityId(req));
  const descriptions = data.map(a => ({ name: a['_id'], bills: null }));
  return resp.json({ code: 0, data: descriptions });
};

export const getEntryMonths = async (req, resp) => {
  const transMonths = await transactions.findAllEntryMonths(req.app.locals.db, getCityId(req));
  const months = buildMonthsList(transMonths);
  return resp.json({ code: 0, data: months });
};

export const getTransMonths = async (req, resp) => {
  const transMonths = await transactions.findAllTransMonths(req.app.locals.db, getCityId(req));
  const months = buildMonthsList(transMonths);
  return resp.json({ code: 0, data: months });
};

const getCityId = req => _.toNumber(req.query.cityId);
