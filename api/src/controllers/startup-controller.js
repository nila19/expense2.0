'use strict';

import _ from 'lodash';

import { accountModel, billModel, categoryModel, cityModel, transactionModel } from 'models';
import { buildMonthsList } from 'utils/month-utils';
import config from 'config/config';

export const doConnect = async (req, resp) => {
  if (!req.app.locals.db) {
    req.app.locals.log.info('DB connection not available...  DB URL :: ' + config.dburl);
    return resp.json({ code: config.error });
  }
  await accountModel.findById(req.app.locals.db, 0);
  return resp.json({ code: 0, data: { env: config.env } });
};

export const getAllCities = async (req, resp) => {
  const data = await cityModel.findAllCities(req.app.locals.db);
  return resp.json({ code: 0, data: data });
};

export const getDefaultCity = async (req, resp) => {
  const data = await cityModel.findDefault(req.app.locals.db);
  return resp.json({ code: 0, data: data });
};

export const getCategories = async (req, resp) => {
  const data = await categoryModel.findForCity(req.app.locals.db, req.body.cityId);
  return resp.json({ code: 0, data: data });
};

export const getDescriptions = async (req, resp) => {
  const data = await transactionModel.findAllDescriptions(req.app.locals.db, req.body.cityId);
  const descriptions = data.map((a) => a['_id']);
  return resp.json({ code: 0, data: descriptions });
};

export const getEntryMonths = async (req, resp) => {
  const transMonths = await transactionModel.findAllEntryMonths(req.app.locals.db, req.body.cityId);
  const months = buildMonthsList(transMonths);
  return resp.json({ code: 0, data: months });
};

export const getTransMonths = async (req, resp) => {
  const transMonths = await transactionModel.findAllTransMonths(req.app.locals.db, req.body.cityId);
  const months = buildMonthsList(transMonths);
  return resp.json({ code: 0, data: months });
};

export const getAccounts = async (req, resp) => {
  const data = await accountModel.findForCity(req.app.locals.db, req.body.cityId);
  return resp.json({ code: 0, data: data });
};

export const getBills = async (req, resp) => {
  const data = await billModel.findForCity(req.app.locals.db, req.body.cityId);
  return resp.json({ code: 0, data: data });
};
