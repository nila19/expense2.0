'use strict';

import _ from 'lodash';
import moment from 'moment';
import numeral from 'numeral';

import { format } from 'config/formats';
import { accountModel, billModel, sequenceModel, transactionModel } from 'models';
import { transferCash } from 'services/cash-service';
import { checkCityEditable } from 'utils/common-utils';

export const addExpense = async (parms, data) => {
  await checkCityEditable(parms.db, data.cityId);
  await loadAccountsInfo(parms, data);
  let tran = copyTransData(data);
  await copyAccountsData(parms, data, tran);
  const seq = await sequenceModel.findOneAndUpdate(parms.db, { table: 'transactions', cityId: data.cityId });
  tran = { ...tran, id: seq.value.seq, seq: seq.value.seq };
  await transactionModel.insertOne(parms.db, tran);
  await transferCash({
    db: parms.db,
    from: data.accounts.from,
    to: data.accounts.to,
    amount: tran.amount,
    seq: 0,
  });
  // re-fetch from DB to get the revised balances after cash transfer
  await loadAccountsInfo(parms, data);
  await transactionModel.updateOne(
    parms.db,
    { id: tran.id },
    {
      $set: {
        'accounts.from.balanceAf': data.accounts.from.balance,
        'accounts.to.balanceAf': data.accounts.to.balance,
      },
    }
  );
  return await transactionModel.findById(parms.db, tran.id);
};

// step 3: fetch from & to accounts info from DB
const loadAccountsInfo = async (parms, data) => {
  const fromId = data.accounts.from && data.accounts.from.id ? data.accounts.from.id : 0;
  const toId = data.accounts.to && data.accounts.to.id ? data.accounts.to.id : 0;
  data.accounts.from = await accountModel.findById(parms.db, fromId);
  data.accounts.to = await accountModel.findById(parms.db, toId);
};

// step 2: copy transaction data from input to transaction record.
const copyTransData = (data) => {
  const trans = {
    id: 0,
    cityId: data.cityId,
    entryDt: moment().format(format.YYYYMMDDHHmmss),
    entryMonth: moment().date(1).format(format.YYYYMMDD),
    category: { id: 0, name: ' ~ ' },
    description: _.startCase(_.lowerCase(data.description.name || data.description)),
    amount: numeral(data.amount).value(),
    transDt: moment(data.transDt, format.YYYYMMDD).format(format.YYYYMMDD),
    transMonth: moment(data.transDt, format.YYYYMMDD).date(1).format(format.YYYYMMDD),
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
  if (data.category && data.category.id) {
    trans.category.id = data.category.id;
    trans.category.name = data.category.name;
  }
  return trans;
};

// step 3: copy accounts data from input to transaction record.
const copyAccountsData = async (parms, data, trans) => {
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
      trans.bill.name = billModel.buildBillName(from, trans.bill);
      const amount = numeral(data.amount).value();
      await billModel.updateOne(parms.db, { id: from.bills.open.id }, { $inc: { amount: amount, balance: amount } });
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
