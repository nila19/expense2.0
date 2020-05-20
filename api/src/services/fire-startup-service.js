'use strict';

import _ from 'lodash';

import config from 'config/config';
import { accountModel, cityModel, landmarkModel } from 'data/fire-models';

export const connectToFirebase = async (firebase, log) => {
  if (!firebase) {
    log.info('Firebase connection not available...  => ' + config.authDomain);
    return { code: config.error };
  }
  const records = await accountModel.find(firebase);
  return { code: 0, data: { fireEnv: config.env, fireCount: records.size } };
};

export const getAllFireCities = async (db) => {
  return await cityModel.findAll(db);
};

export const getCapitalFireCities = async (db) => {
  return await cityModel.findCapitals(db);
};

export const getPopulatedCapitalFireCities = async (db) => {
  return await cityModel.findPopulatedCapitals(db);
};

export const getCAFireCities = async (db) => {
  return await cityModel.findCACities(db);
};

export const getMuseumLandmarks = async (db) => {
  return await landmarkModel.findMuseums(db);
};
