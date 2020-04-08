'use strict';

import _ from 'lodash';
import moment from 'moment';
import numeral from 'numeral';

import { accounts, bills, sequences, transactions } from '../models/index';

import { transferCash } from './cash-service';
import { checkCityEditable } from '../utils/common-utils';
import format from '../config/formats';

export const addExpense = async (parms, data) => {
  await checkCityEditable(parms.db, data.city.id);
  await loadAccountsInfo(parms, data);
  let tran = copyTransData(data);
  copyAccountsData(data, tran);
  const seq = await sequences.findOneAndUpdate(parms.db, { table: 'transactions', cityId: data.city.id });
  tran = { ...tran, id: seq.value.seq, seq: seq.value.seq };
  await transactions.insertOne(parms.db, tran);
  await transferCash({
    db: parms.db,
    from: data.accounts.from,
    to: data.accounts.to,
    amount: tran.amount,
    seq: 0,
  });
  // re-fetch from DB to get the revised balances after cash transfer
  await loadAccountsInfo(parms, data);
  await transactions.updateOne(
    parms.db,
    { id: tran.id },
    {
      $set: {
        'accounts.from.balanceAf': data.accounts.from.balance,
        'accounts.to.balanceAf': data.accounts.to.balance,
      },
    }
  );
  return tran;
};

// step 3: fetch from & to accounts info from DB
const loadAccountsInfo = async (parms, data) => {
  data.accounts.from = await accounts.findById(parms.db, data.accounts.from ? data.accounts.from.id : 0);
  data.accounts.to = await accounts.findById(parms.db, data.accounts.to ? data.accounts.to.id : 0);
};

// step 2: copy transaction data from input to transaction record.
const copyTransData = (data) => {
  const trans = {
    id: 0,
    cityId: data.city.id,
    entryDt: moment().format(format.YYYYMMDDHHmmss),
    entryMonth: moment().date(1).format(format.YYYYMMDD),
    category: { id: 0, name: ' ~ ' },
    description: _.startCase(_.lowerCase(data.description.name || data.description)),
    amount: numeral(data.amount).value(),
    transDt: moment(data.transDt, format.DDMMMYYYY).format(format.YYYYMMDD),
    transMonth: moment(data.transDt, format.DDMMMYYYY).date(1).format(format.YYYYMMDD),
    seq: 0,
    accounts: {
      from: { id: 0, name: '', balanceBf: 0, balanceAf: 0 },
      to: { id: 0, name: '', balanceBf: 0, balanceAf: 0 },
    },
    adhoc: data.adhoc,
    adjust: data.adjust,
    status: true,
    tallied: false,
    tallyDt: null,
  };
  if (data.category) {
    trans.category.id = data.category.id;
    trans.category.name = data.category.name;
  }
  return trans;
};

// step 3: copy accounts data from input to transaction record.
const copyAccountsData = (data, trans) => {
  const from = data.accounts.from;
  const to = data.accounts.to;
  if (from.id) {
    trans.accounts.from = {
      id: from.id,
      name: from.name,
      balanceBf: from.balance,
      balanceAf: from.balance,
    };
    if (from.billed && from.bills && from.bills.open) {
      trans.bill = {
        id: from.bills.open.id,
        account: { id: from.id, name: from.name },
        billDt: from.bills.open.billDt,
      };
      trans.bill.name = bills.buildBillName(from, trans.bill);
    }
  }
  if (to.id) {
    trans.accounts.to = {
      id: to.id,
      name: to.name,
      balanceBf: to.balance,
      balanceAf: to.balance,
    };
  }
};
