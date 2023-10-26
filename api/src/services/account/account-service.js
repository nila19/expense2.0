'use strict';

import moment from 'moment';

import { COLLECTION, FORMAT } from 'config/constants';

import { sequenceModel } from 'data/models';
import { accountService } from 'data/services';

import { checkCityEditable } from 'utils/common-utils';

export const findAll = async ({ db }, data) => {
  return await accountService.findAllForCity(db, data.cityId);
};

export const addAcct = async ({ db }, data) => {
  await checkCityEditable(db, data.cityId);

  const acct = await buildAcct(db, data);
  return await accountService.addAcct(db, data.cityId, acct);
};

export const modifyAcct = async ({ db }, data) => {
  await checkCityEditable(db, data.cityId);
  return await accountService.modifyAcct(db, data.cityId, data);
};

const buildAcct = async (db, data) => {
  const seq = await sequenceModel.findNextSeq(db, data.cityId, COLLECTION.ACCOUNT);
  return { ...data, id: seq, tallyBalance: 0, tallyDt: moment().format(FORMAT.YYYYMMDDHHmmss) };
};
