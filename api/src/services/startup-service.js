'use strict';

import _ from 'lodash';

import config from 'config/config';
import { MONTH_TYPE } from 'config/formats';
import { accountModel, billModel, categoryModel, cityModel, descriptionModel, monthModel } from 'data/models';
import {
  accountModel as fireAccountModel,
  cityModel as fireCityModel,
  landmarkModel as fireLandmarkModel,
} from 'fire-models';
import { buildMonthsList } from 'utils/month-utils';

export const connectToMongoDB = async (db, log) => {
  if (!db) {
    log.info('MongoDB connection not available...  => ' + config.dburl);
    return { code: config.error };
  }
  const records = await accountModel.findAll(db);
  return { code: 0, data: { mongoEnv: config.env, mongoCount: records.length } };
};

export const connectToFirebase = async (firebase, log) => {
  if (!firebase) {
    log.info('Firebase connection not available...  => ' + config.authDomain);
    return { code: config.error };
  }
  const records = await fireAccountModel.find(firebase);
  return { code: 0, data: { fireEnv: config.env, fireCount: records.size } };
};

export const getAllCities = async (db) => {
  return await cityModel.findAll(db);
};

export const getAllFireCities = async (db) => {
  return await fireCityModel.findAll(db);
};

export const getCapitalFireCities = async (db) => {
  return await fireCityModel.findCapitals(db);
};

export const getPopulatedCapitalFireCities = async (db) => {
  return await fireCityModel.findPopulatedCapitals(db);
};

export const getCAFireCities = async (db) => {
  return await fireCityModel.findCACities(db);
};

export const getMuseumLandmarks = async (db) => {
  return await fireLandmarkModel.findMuseums(db);
};

export const getDefaultCity = async (db) => {
  return await cityModel.findDefault(db);
};

export const getCategories = async (db, cityId) => {
  return await categoryModel.findForCity(db, cityId);
};

export const getDescriptions = async (db, cityId) => {
  const data = await descriptionModel.findForCity(db, cityId);
  return data.map((e) => e.id);
};

export const getEntryMonths = async (db, cityId) => {
  const entryMonths = await monthModel.findForCity(db, cityId, MONTH_TYPE.ENTRY);
  const months = entryMonths.map((e) => e.id);
  return buildMonthsList(months);
};

export const getTransMonths = async (db, cityId) => {
  const transMonths = await monthModel.findForCity(db, cityId, MONTH_TYPE.TRANS);
  const months = transMonths.map((e) => e.id);
  return buildMonthsList(months);
};

export const getAccounts = async (db, cityId) => {
  return await accountModel.findForCity(db, cityId);
};

export const getBills = async (db, cityId) => {
  return await billModel.findForCity(db, cityId);
};
