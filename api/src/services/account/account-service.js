'use strict';

import moment from 'moment';
import numeral from 'numeral';

import { COLLECTION, FORMAT } from 'config/constants';

import { sequenceModel } from 'data/models';
import { accountService } from 'data/services';

import { checkCityEditable, checkAccountDeletable } from 'utils/common-utils';
import { async } from 'regenerator-runtime';

export const findAll = async ({ db }, data) => {
  return await accountService.findAllForCity(db, data.cityId);
};

export const addAccount = async ({ db }, data) => {
  await checkCityEditable(db, data.cityId);

  const acct = await buildAccount(db, data);
  return await accountService.addAccount(db, data.cityId, acct);
};

export const modifyAccount = async ({ db }, data) => {
  await checkCityEditable(db, data.cityId);
  return await accountService.modifyAccount(db, data.cityId, data);
};

export const deleteAccount = async ({ db }, data) => {
  await checkCityEditable(db, data.cityId);
  await checkAccountDeletable(db, data.cityId, data.id);
  return await accountService.deleteAccount(db, { id: data.id });
};

const buildAccount = async (db, data) => {
  const id = await sequenceModel.findNextSeq(db, data.cityId, COLLECTION.ACCOUNT);
  return {
    ...data,
    id: id,
    balance: numeral(data.balance).value(),
    seq: numeral(data.seq).value(),
    tallyBalance: 0,
    tallyDt: moment().format(FORMAT.YYYYMMDDHHmmss),
  };
};
