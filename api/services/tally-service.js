'use strict';

import moment from 'moment';

import { accounts, sequences, tallyhistories, transactions } from '../models';

import { checkCityEditable } from '../utils/common-utils';
import format from '../config/formats';

export const tallyAccount = async (parms) => {
  const tallyDt = moment().format(format.YYYYMMDDHHmmss);

  const account = await accounts.findById(parms.db, parms.acctId);
  await checkCityEditable(parms.db, account.cityId);
  await accounts.updateOne(parms.db, { id: account.id }, { $set: { tallyBalance: account.balance, tallyDt: tallyDt } });
  const seq = await sequences.findOneAndUpdate(parms.db, { table: 'tallyhistories', cityId: account.cityId });
  await tallyhistories.insertOne(parms.db, buildTallyHistory(seq.value.seq, account, tallyDt));
  const trans = await transactions.findForAcct(parms.db, account.cityId, account.id);

  for (const tran of trans) {
    if (!tran.tallied) {
      await transactions.updateOne(parms.db, { id: tran.id }, { $set: { tallied: true, tallyDt: tallyDt } });
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
