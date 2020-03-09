'use strict';

import _ from 'lodash';
import moment from 'moment';
import string from 'sugar/string';

import { accounts, bills, transactions } from '../models';

import { transferCash } from './cash-service';
import { checkCityEditable, checkAccountsActive } from '../utils/common-utils';
import format from '../config/formats';

export const modifyExpense = async (parms, data) => {
  data.amount = _.toNumber(data.amount);
  const tran = await transactions.findById(parms.db, data.id);
  await checkCityEditable(parms.db, tran.cityId);
  await loadAccountsInfo(parms, data);
  const finImpact = checkFinImpact(data, tran);
  checkAccountsActive(finImpact, data.accounts.from, data.accounts.to);

  const billChange = checkBillChangeNeeded(data, tran);
  await modifyBillBalance(parms, data, tran, billChange);
  await adjustCash(parms, data, tran, finImpact);
  copyTransData(data, tran);
  await calcTransAcctBalances(parms, data, tran, finImpact);
  await transactions.updateTrans(parms.db, tran);
};

const loadAccountsInfo = async (parms, data) => {
  data.accounts.from = await accounts.findById(parms.db, data.accounts.from ? data.accounts.from.id : 0);
  data.accounts.to = await accounts.findById(parms.db, data.accounts.to ? data.accounts.to.id : 0);
};

const checkFinImpact = (data, trans) => {
  let finImpact = false;
  if (trans.amount != data.amount) {
    finImpact = true;
  } else if (trans.accounts.from.id != data.accounts.from.id) {
    finImpact = true;
  } else if (trans.adjust && trans.accounts.to.id != data.accounts.to.id) {
    finImpact = true;
  }
  return finImpact;
};

// step 4: check if there is any change in bill & if a modification to bill is needed.
const checkBillChangeNeeded = (data, trans) => {
  let billChange = false;
  // if no bill before & after change, then skip.
  if (!trans.bill && !data.bill) {
    billChange = false;
  } else if ((trans.bill && !data.bill) || (!trans.bill && data.bill)) {
    billChange = true;
  } else if (trans.bill.id !== data.bill.id) {
    billChange = true;
  } else if (trans.amount !== data.amount) {
    billChange = true;
  }
  return billChange;
};

const modifyBillBalance = async (parms, data, tr, billChange) => {
  if (!billChange) {
    return;
  }
  // reverse the trans balance & add the 'data' balance.
  if (tr.bill) {
    await bills.findOneAndUpdate(parms.db, { id: tr.bill.id }, { $inc: { amount: -tr.amount, balance: -tr.amount } });
  }
  if (data.bill) {
    await bills.findOneAndUpdate(
      parms.db,
      { id: data.bill.id },
      { $inc: { amount: data.amount, balance: data.amount } }
    );
  }
};

const adjustCash = async (parms, data, trans, finImpact) => {
  if (finImpact) {
    return;
  }
  // reverse the from / to accounts to reverse cash first.
  await transferCash({
    db: parms.db,
    from: trans.accounts.to,
    to: trans.accounts.from,
    amount: trans.amount,
    seq: trans.seq
  });
  await transferCash({
    db: parms.db,
    from: data.accounts.from,
    to: data.accounts.to,
    amount: data.amount,
    seq: data.seq
  });
};

// step 2: copy transaction data from input to transaction record.
const copyTransData = (data, trans) => {
  trans.category = { id: 0, name: ' ~ ' };
  if (data.category) {
    trans.category.id = data.category.id;
    trans.category.name = data.category.name;
  }
  delete trans.bill;
  if (data.bill) {
    trans.bill = {
      id: data.bill.id,
      name: data.bill.name,
      account: { id: data.accounts.from.id, name: data.accounts.from.name }
    };
  }
  trans.description = string.String(data.description.name || data.description).capitalize(false, true).raw;
  trans.amount = _.toNumber(data.amount);
  if (trans.transDt !== data.transDt) {
    trans.transDt = moment(data.transDt, format.DDMMMYYYY).format(format.YYYYMMDD);
    trans.transMonth = moment(data.transDt, format.DDMMMYYYY)
      .date(1)
      .format(format.YYYYMMDD);
  }
  trans.adhoc = data.adhoc;
  trans.adjust = data.adjust;
  trans.tallied = false;
  trans.tallyDt = null;
  // retain the old balanceBf/balanceAf amounts hoping no finImpact..
  // if finImpact, these will be revised by the next method...
  if (data.accounts.from.id) {
    trans.accounts.from = {
      id: data.accounts.from.id,
      name: data.accounts.from.name,
      balanceBf: trans.accounts.from.balanceBf,
      balanceAf: trans.accounts.from.balanceAf
    };
  } else {
    trans.accounts.from = { id: 0, name: '', balanceBf: 0, balanceAf: 0 };
  }
  if (data.accounts.to.id) {
    trans.accounts.to = {
      id: data.accounts.to.id,
      name: data.accounts.to.name,
      balanceBf: trans.accounts.to.balanceBf,
      balanceAf: trans.accounts.to.balanceAf
    };
  } else {
    trans.accounts.to = { id: 0, name: '', balanceBf: 0, balanceAf: 0 };
  }
};

const calcTransAcctBalances = async (parms, data, trans, finImpact) => {
  if (!finImpact) {
    return resolve();
  }
  await calcTransAcctBalance(parms, trans, trans.accounts.from, data.accounts.from.cash);
  await calcTransAcctBalance(parms, trans, trans.accounts.to, data.accounts.to.cash);
};

const calcTransAcctBalance = async (parms, trans, acct, cash) => {
  if (!acct.id) {
    return;
  }
  const prev = await transactions.findPrevious(parms.db, trans.cityId, acct.id, trans.seq);
  if (acct.id === prev.accounts.from.id) {
    acct.balanceBf = prev.accounts.from.balanceAf;
  } else if (acct.id === prev.accounts.to.id) {
    acct.balanceBf = prev.accounts.to.balanceAf;
  }
  const amt = cash ? trans.amount : trans.amount * -1;
  acct.balanceAf = acct.balanceBf - amt;
};
