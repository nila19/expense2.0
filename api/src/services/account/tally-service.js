'use strict';

import moment from 'moment';

import { FORMAT } from 'config/formats';
import { accountModel, sequenceModel, tallyHistoryModel, transactionModel } from 'models';
import { checkCityEditable } from 'utils/common-utils';

export const tallyAccount = async ({ db }, acctId) => {
  const tallyDt = moment().format(FORMAT.YYYYMMDDHHmmss);

  const account = await accountModel.findById(db, acctId);
  await checkCityEditable(db, account.cityId);

  // update account with last tallied info
  await accountModel.findOneAndUpdate(
    db,
    { id: account.id },
    { $set: { tallyBalance: account.balance, tallyDt: tallyDt } }
  );

  // insert tally history record
  const tallyRecord = await buildTallyRecord(db, account, tallyDt);
  await tallyHistoryModel.insertOne(db, tallyRecord);

  // mark the un-tallied trans as tallied
  const trans = await transactionModel.findNotTallied(db, account.cityId, account.id);
  const p0 = trans.map(async (tran) => {
    return transactionModel.findOneAndUpdate(db, { id: tran.id }, { $set: { tallied: true, tallyDt: tallyDt } });
  });
  await Promise.all(p0);
};

const buildTallyRecord = async (db, account, tallyDt) => {
  const sequence = await sequenceModel.findOneAndUpdate(db, { table: 'tallyhistories', cityId: account.cityId });
  return {
    id: sequence.value.seq,
    account: { id: account.id, name: account.name },
    cityId: account.cityId,
    tallyDt: tallyDt,
    balance: account.balance,
  };
};
