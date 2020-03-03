'use strict';

import Promise, { all } from 'bluebird';
import moment from 'moment';
import numeral from 'numeral';
import string from 'sugar/string';

import { accounts, bills, sequences, transactions } from '../models/index';

import { transferCash } from './cash-service';
import format from '../config/formats';
import { checkCityEditable, logErr } from '../utils/common-utils';

export const addExpense = (parms, data, next) => {
  addExpensePromise(parms, data)
    .then(tran => next(null, tran))
    .catch(err => next(err));
};

export const addExpensePromise = (parms, data) => {
  return new Promise((resolve, reject) => {
    let _trans = null;
    checkCityEditable(parms.db, data.city.id)
      .then(() => getAccountsInfo(parms, data))
      .then(() => copyTransData(data))
      .then(trans => {
        _trans = trans;
        return copyAccountsData(data, _trans);
      })
      .then(() => {
        return sequences.getNextSeq(parms.db, { table: 'transactions', cityId: data.city.id });
      })
      .then(seq => {
        _trans.id = seq.seq;
        _trans.seq = seq.seq;
        return transactions.insert(parms.db, _trans);
      })
      .then(() => {
        return transferCash({
          db: parms.db,
          from: data.accounts.from,
          to: data.accounts.to,
          amount: _trans.amount,
          seq: 0
        });
      })
      // re-fetch from DB to get the revised balances after cash transfer
      .then(() => getAccountsInfo(parms, data))
      .then(() => {
        return transactions.update(
          parms.db,
          { id: _trans.id },
          {
            $set: {
              'accounts.from.balanceAf': data.accounts.from.balance,
              'accounts.to.balanceAf': data.accounts.to.balance
            }
          }
        );
      })
      .then(() => resolve(_trans))
      .catch(err => {
        logErr(parms.log, err);
        return reject(err);
      });
  });
};

// step 3: fetch from & to accounts info from DB
const getAccountsInfo = (parms, data) => {
  return new Promise((resolve, reject) => {
    const promises = [];
    promises.push(accounts.findById(parms.db, data.accounts.from ? data.accounts.from.id : 0));
    promises.push(accounts.findById(parms.db, data.accounts.to ? data.accounts.to.id : 0));
    all(promises)
      .then(accounts => {
        data.accounts.from = accounts[0];
        data.accounts.to = accounts[1];
        return resolve();
      })
      .catch(err => reject(err));
  });
};

// step 2: copy transaction data from input to transaction record.
const copyTransData = data => {
  return new Promise(resolve => {
    const trans = {
      id: 0,
      cityId: data.city.id,
      entryDt: moment().format(format.YYYYMMDDHHmmss),
      entryMonth: moment()
        .date(1)
        .format(format.YYYYMMDD),
      category: { id: 0, name: ' ~ ' },
      description: string.String(data.description.name || data.description).capitalize(false, true).raw,
      amount: numeral(data.amount).value(),
      transDt: moment(data.transDt, format.DDMMMYYYY).format(format.YYYYMMDD),
      transMonth: moment(data.transDt, format.DDMMMYYYY)
        .date(1)
        .format(format.YYYYMMDD),
      seq: 0,
      accounts: {
        from: { id: 0, name: '', balanceBf: 0, balanceAf: 0 },
        to: { id: 0, name: '', balanceBf: 0, balanceAf: 0 }
      },
      adhoc: data.adhoc,
      adjust: data.adjust,
      status: true,
      tallied: false,
      tallyDt: null
    };
    if (data.category) {
      trans.category.id = data.category.id;
      trans.category.name = data.category.name;
    }
    return resolve(trans);
  });
};

// step 3: copy accounts data from input to transaction record.
const copyAccountsData = (data, trans) => {
  return new Promise(resolve => {
    const from = data.accounts.from;
    const to = data.accounts.to;
    if (from.id) {
      trans.accounts.from = {
        id: from.id,
        name: from.name,
        balanceBf: from.balance,
        balanceAf: from.balance
      };
      if (from.billed && from.bills && from.bills.open) {
        trans.bill = {
          id: from.bills.open.id,
          account: { id: from.id, name: from.name },
          billDt: from.bills.open.billDt
        };
        trans.bill.name = bills.getName(from, trans.bill);
      }
    }
    if (to.id) {
      trans.accounts.to = {
        id: to.id,
        name: to.name,
        balanceBf: to.balance,
        balanceAf: to.balance
      };
    }
    return resolve();
  });
};
