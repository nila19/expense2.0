'use strict';

import _ from 'lodash';

import config from 'config/config';
import { accountModel, billModel, categoryModel, cityModel, transactionModel } from 'models';
import { buildMonthsList } from 'utils/month-utils';

export const doConnect = async (db, log) => {
  if (!db) {
    log.info('DB connection not available...  DB URL :: ' + config.dburl);
    return { code: config.error };
  }
  await accountModel.findById(db, 0);
  return { code: 0, data: { env: config.env } };
};

export const getAllCities = async (db) => {
  return await cityModel.findAllCities(db);
};

export const getDefaultCity = async (db) => {
  return await cityModel.findDefault(db);
};

export const getCategories = async (db, cityId) => {
  return await categoryModel.findForCity(db, cityId);
};

export const getDescriptions = async (db, cityId) => {
  const data = await transactionModel.findAllDescriptions(db, cityId);
  return data.map((a) => a['_id']);
};

export const getEntryMonths = async (db, cityId) => {
  const transMonths = await transactionModel.findAllEntryMonths(db, cityId);
  return buildMonthsList(transMonths);
};

export const getTransMonths = async (db, cityId) => {
  const transMonths = await transactionModel.findAllTransMonths(db, cityId);
  return buildMonthsList(transMonths);
};

export const getAccounts = async (db, cityId) => {
  return await accountModel.findForCity(db, cityId);
};

export const getBills = async (db, cityId) => {
  return await billModel.findForCity(db, cityId);
};
