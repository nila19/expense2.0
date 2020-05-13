'use strict';

import _ from 'lodash';
import moment from 'moment';

import { format } from 'config/formats';
import { accountModel, billModel, transactionModel } from 'models';
import { transferCash } from 'services/cash-service';
import { checkCityEditable, checkAccountsActive } from 'utils/common-utils';

export const modifyExpense = async (parms, data) => {
  data.amount = _.toNumber(data.amount);
  const tran = await transactionModel.findById(parms.db, data.id);
  await checkCityEditable(parms.db, tran.cityId);
  await loadAccountsInfo(parms, data);
  const finImpact = checkFinImpact(data, tran);
  checkAccountsActive(finImpact, data.accounts.from, data.accounts.to);

  const billChange = checkBillChangeNeeded(data, tran);
  await modifyBillBalance(parms, data, tran, billChange);
  await adjustCash(parms, data, tran, finImpact);
  copyTransData(data, tran);
  await calcTransAcctBalances(parms, data, tran, finImpact);
  await transactionModel.updateTrans(parms.db, tran);
};

const loadAccountsInfo = async (parms, data) => {
  data.accounts.from = await accountModel.findById(parms.db, data.accounts.from.id ? data.accounts.from.id : 0);
  data.accounts.to = await accountModel.findById(parms.db, data.accounts.to.id ? data.accounts.to.id : 0);
};

const checkFinImpact = (data, tran) => {
  let finImpact = false;
  if (tran.amount !== data.amount) {
    finImpact = true;
  } else if (tran.accounts.from.id !== data.accounts.from.id) {
    finImpact = true;
  } else if (tran.adjust && tran.accounts.to.id !== data.accounts.to.id) {
    finImpact = true;
  }
  return finImpact;
};

// step 4: check if there is any change in bill & if a modification to bill is needed.
const checkBillChangeNeeded = (data, tran) => {
  let billChange = false;
  // if no bill before & after change, then skip.
  const transBillId = tran.bill && tran.bill.id;
  const dataBillId = data.bill && data.bill.id;
  if (!transBillId && !dataBillId) {
    billChange = false;
  } else if ((transBillId && !dataBillId) || (!transBillId && dataBillId)) {
    billChange = true;
  } else if (transBillId !== dataBillId) {
    billChange = true;
  } else if (tran.amount !== data.amount) {
    billChange = true;
  }
  return billChange;
};

const modifyBillBalance = async (parms, data, tran, billChange) => {
  if (!billChange) {
    return;
  }
  // reverse the trans balance & add the 'data' balance.
  if (tran.bill) {
    await billModel.findOneAndUpdate(
      parms.db,
      { id: tran.bill.id },
      { $inc: { amount: -tran.amount, balance: -tran.amount } }
    );
  }
  if (data.bill && data.bill.id) {
    await billModel.findOneAndUpdate(
      parms.db,
      { id: data.bill.id },
      { $inc: { amount: data.amount, balance: data.amount } }
    );
  }
};

const adjustCash = async (parms, data, tran, finImpact) => {
  if (!finImpact) {
    return;
  }
  // reverse the from / to accounts to reverse cash first.
  await transferCash({
    db: parms.db,
    from: tran.accounts.to,
    to: tran.accounts.from,
    amount: tran.amount,
    seq: tran.seq,
  });
  await transferCash({
    db: parms.db,
    from: data.accounts.from,
    to: data.accounts.to,
    amount: data.amount,
    seq: data.seq,
  });
};

// step 2: copy transaction data from input to transaction record.
const copyTransData = (data, tran) => {
  tran.category = { id: 0, name: ' ~ ' };
  if (data.category && data.category.id) {
    tran.category.id = data.category.id;
    tran.category.name = data.category.name;
  }
  delete tran.bill;
  if (data.bill && data.bill.id) {
    tran.bill = {
      id: data.bill.id,
      name: data.bill.name,
      account: { id: data.accounts.from.id, name: data.accounts.from.name },
    };
  }
  tran.description = _.startCase(_.lowerCase(data.description.name || data.description));
  tran.amount = _.toNumber(data.amount);
  if (tran.transDt !== data.transDt) {
    tran.transDt = moment(data.transDt, format.YYYYMMDD).format(format.YYYYMMDD);
    tran.transMonth = moment(data.transDt, format.YYYYMMDD).date(1).format(format.YYYYMMDD);
  }
  tran.adhoc = data.adhoc;
  tran.adjust = data.adjust;
  tran.tallied = false;
  tran.tallyDt = null;
  // retain the old balanceBf/balanceAf amounts hoping no finImpact..
  // if finImpact, these will be revised by the next method...
  if (data.accounts.from.id) {
    tran.accounts.from = {
      id: data.accounts.from.id,
      name: data.accounts.from.name,
      balanceBf: tran.accounts.from.balanceBf,
      balanceAf: tran.accounts.from.balanceAf,
    };
  } else {
    tran.accounts.from = { id: 0, name: '', balanceBf: 0, balanceAf: 0 };
  }
  if (data.accounts.to.id) {
    tran.accounts.to = {
      id: data.accounts.to.id,
      name: data.accounts.to.name,
      balanceBf: tran.accounts.to.balanceBf,
      balanceAf: tran.accounts.to.balanceAf,
    };
  } else {
    tran.accounts.to = { id: 0, name: '', balanceBf: 0, balanceAf: 0 };
  }
};

const calcTransAcctBalances = async (parms, data, tran, finImpact) => {
  if (!finImpact) {
    return;
  }
  await calcTransAcctBalance(parms, tran, tran.accounts.from, data.accounts.from.cash);
  await calcTransAcctBalance(parms, tran, tran.accounts.to, data.accounts.to.cash);
};

const calcTransAcctBalance = async (parms, tran, acct, cash) => {
  if (!acct.id) {
    return;
  }
  const prev = await transactionModel.findPrevious(parms.db, tran.cityId, acct.id, tran.seq);
  if (acct.id === prev.accounts.from.id) {
    acct.balanceBf = prev.accounts.from.balanceAf;
  } else if (acct.id === prev.accounts.to.id) {
    acct.balanceBf = prev.accounts.to.balanceAf;
  }
  const amt = cash ? tran.amount : tran.amount * -1;
  acct.balanceAf = acct.balanceBf - amt;
};
