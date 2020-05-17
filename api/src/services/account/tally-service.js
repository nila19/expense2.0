'use strict';

import moment from 'moment';

import { FORMAT } from 'config/formats';
import { accountModel, sequenceModel, tallyHistoryModel, transactionModel } from 'models';
import { checkCityEditable } from 'utils/common-utils';

export const tallyAccount = async (parms, acctId) => {
  const tallyDt = moment().format(FORMAT.YYYYMMDDHHmmss);

  const account = await accountModel.findById(parms.db, acctId);
  await checkCityEditable(parms.db, account.cityId);
  await accountModel.findOneAndUpdate(
    parms.db,
    { id: account.id },
    { $set: { tallyBalance: account.balance, tallyDt: tallyDt } }
  );
  const seq = await sequenceModel.findOneAndUpdate(parms.db, { table: 'tallyhistories', cityId: account.cityId });
  await tallyHistoryModel.insertOne(parms.db, buildTallyHistory(seq.value.seq, account, tallyDt));
  const trans = await transactionModel.findForAcct(parms.db, account.cityId, account.id);

  for (const tran of trans) {
    if (!tran.tallied) {
      await transactionModel.findOneAndUpdate(parms.db, { id: tran.id }, { $set: { tallied: true, tallyDt: tallyDt } });
    }
  }
};

const buildTallyHistory = (seq, ac, tallyDt) => {
  return {
    id: seq,
    account: { id: ac.id, name: ac.name },
    cityId: ac.cityId,
    tallyDt: tallyDt,
    balance: ac.balance,
  };
};
