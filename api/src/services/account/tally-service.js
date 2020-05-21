'use strict';

import moment from 'moment';

import { FORMAT, COLLECTION } from 'config/constants';

import { accountModel, sequenceModel, tallyHistoryModel } from 'data/models';
import { accountService, transactionService } from 'data/services';

import { checkCityEditable } from 'utils/common-utils';

export const tallyAccount = async ({ db }, acctId) => {
  const tallyDt = moment().format(FORMAT.YYYYMMDDHHmmss);

  const account = await accountModel.findById(db, acctId);
  await checkCityEditable(db, account.cityId);

  // update account with last tallied info
  await accountService.updateTallyInfo(db, account, tallyDt);

  // mark the un-tallied trans as tallied
  await transactionService.updateTallyInfo(db, account, tallyDt);

  // insert tally history record
  const tallyRecord = await buildTallyRecord(db, account, tallyDt);
  await tallyHistoryModel.insertOne(db, tallyRecord);
};

const buildTallyRecord = async (db, account, tallyDt) => {
  const seq = await sequenceModel.findNextSeq(db, account.cityId, COLLECTION.TALLY);
  return {
    id: seq,
    account: { id: account.id, name: account.name },
    cityId: account.cityId,
    tallyDt: tallyDt,
    balance: account.balance,
  };
};
