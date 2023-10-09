'use strict';

import _ from 'lodash';
import moment from 'moment';
import numeral from 'numeral';

import { FORMAT } from 'config/constants';

import { buildBillName } from 'utils/common-utils';

const blankAcct = { id: 0, name: '', balanceBf: 0, balanceAf: 0 };
const blankCategory = { id: 0, name: ' ~ ' };
const getCategory = (category) => {
  return category?.id ? { id: category.id, name: category.name } : blankCategory;
};

// used in both create & modify
export const buildTranBasic = (data) => {
  const transDt = moment(data.transDt, FORMAT.YYYYMMDD);
  const entryDt = data.entryDt ? moment(data.entryDt, FORMAT.YYYYMMDDHHmmss) : moment();
  const category = getCategory(data.category);
  const tran = {
    id: data.id,
    seq: data.seq,
    cityId: data.cityId,
    entryDt: entryDt.format(FORMAT.YYYYMMDDHHmmss),
    entryMonth: entryDt.date(1).format(FORMAT.YYYYMMDD),
    entryYear: entryDt.year(),
    category: category,
    description: _.startCase(_.lowerCase(data.description.name || data.description)),
    amount: numeral(data.amount).value(),
    transDt: transDt.format(FORMAT.YYYYMMDD),
    transMonth: transDt.date(1).format(FORMAT.YYYYMMDD),
    transYear: transDt.year(),
    adhoc: data.adhoc,
    adjust: data.adjust,
    status: true,
    tallied: false,
    tallyDt: null,
    billPay: data.billPay,
  };
  return tran;
};

export const buildTranAccountsNew = ({ from, to }) => {
  const accounts = { from: blankAcct, to: blankAcct };
  if (from?.id) {
    const { id, name, balance } = from;
    accounts.from = { id, name, balanceBf: balance, balanceAf: 0 };
  }
  if (to?.id) {
    const { id, name, balance } = to;
    accounts.to = { id, name, balanceBf: balance, balanceAf: 0 };
  }
  return { accounts };
};

export const buildTranBillNew = ({ from }) => {
  let bill = null;
  if (from?.id && from?.billed && from?.bills?.open) {
    const openBill = from.bills.open;
    bill = {
      id: openBill.id,
      name: buildBillName(from, openBill),
      account: { id: from.id, name: from.name },
      billDt: openBill.billDt,
    };
  }
  return { bill };
};

export const buildTranAccountsModify = ({ from, to }, oldTran) => {
  const accounts = { from: blankAcct, to: blankAcct };
  if (from?.id) {
    const { id, name } = from;
    // retain the old balanceBf/balanceAf amounts hoping no finImpact..
    // if finImpact, these will be revised by the next method...
    accounts.from = { ...oldTran.accounts.from, id, name };
  }
  if (to?.id) {
    const { id, name } = to;
    accounts.to = { ...oldTran.accounts.to, id, name };
  }
  return { accounts };
};

export const buildTranBillModify = (data) => {
  let bill = null;
  if (data.bill?.id) {
    const { id, name, billDt } = data.bill;
    const { from } = data.accounts;
    bill = { id, name, billDt };
    bill.account = { id: from.id, name: from.name };
  }
  return { bill };
};
