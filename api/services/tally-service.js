'use strict';

import moment from 'moment';
import async from 'async';

import { accounts, sequences, tallyhistories, transactions } from '../models';

import { checkCityEditable, logErr } from '../utils/common-utils';
import format from '../config/formats';

export const tally = function(parms, next) {
  const tallyDt = moment().format(format.YYYYMMDDHHmmss);
  let acct = null;
  accounts
    .findById(parms.db, parms.acctId)
    .then(account => {
      acct = account;
      return checkCityEditable(parms.db, acct.cityId);
    })
    .then(() => accounts.update(parms.db, { id: acct.id }, { $set: { tallyBalance: acct.balance, tallyDt: tallyDt } }))
    .then(() => sequences.getNextSeq(parms.db, { table: 'tallyhistories', cityId: acct.cityId }))
    .then(seq => tallyhistories.insert(parms.db, buildTallyHistory(seq, acct, tallyDt)))
    .then(() => transactions.findForAcct(parms.db, acct.cityId, acct.id))
    .then(trans => {
      async.each(trans, function(tran, cb) {
        return updateTran(parms.db, tran, tallyDt, cb);
      });
    })
    .then(() => next())
    .catch(err => {
      logErr(parms.log, err);
      return next(err);
    });
};

const buildTallyHistory = (seq, ac, tallyDt) => {
  return {
    id: seq.seq,
    account: { id: ac.id, name: ac.name },
    cityId: ac.cityId,
    tallyDt: tallyDt,
    balance: ac.balance
  };
};

const updateTran = (db, tran, tallyDt, next) => {
  if (tran.tallied) {
    return next();
  }
  transactions
    .update(db, { id: tran.id }, { $set: { tallied: true, tallyDt: tallyDt } })
    .then(() => next())
    .catch(err => next(err));
};
