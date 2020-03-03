'use strict';

import _ from 'lodash';
import Promise from 'bluebird';
import moment from 'moment';
import string from 'sugar/string';

import { accounts, bills, transactions } from '../models';

import { transferCash } from './cash-service';
import format from '../config/formats';
import { checkCityEditable, checkAccountsActive, logErr } from '../utils/common-utils';

export const modifyExpense = (parms, data, next) => {
  let _trans = null;
  let _finImpact = null;
  let _billChange = null;
  data.amount = _.toNumber(data.amount);
  transactions
    .findById(parms.db, data.id)
    .then(trans => {
      _trans = trans;
      return checkCityEditable(parms.db, _trans.cityId);
    })
    .then(() => getAccountsInfo(parms, data))
    .then(() => checkFinImpact(data, _trans))
    .then(finImpact => {
      _finImpact = finImpact;
      return checkAccountsActive(_finImpact, data.accounts.from, data.accounts.to);
    })
    .then(() => checkBillChangeNeeded(data, _trans))
    .then(billChange => {
      _billChange = billChange;
      return modifyBillBalance(parms, data, _trans, _billChange);
    })
    .then(() => adjustCash(parms, data, _trans, _finImpact))
    .then(() => copyTransData(data, _trans))
    .then(() => calcTransAcctBal(parms, data, _trans, _finImpact))
    .then(() => transactions.updateTrans(parms.db, _trans))
    .then(() => next())
    .catch(err => {
      logErr(parms.log, err);
      return next(err);
    });
};

const getAccountsInfo = (parms, data) => {
  return new Promise((resolve, reject) => {
    const promises = [];
    promises.push(accounts.findById(parms.db, data.accounts.from ? data.accounts.from.id : 0));
    promises.push(accounts.findById(parms.db, data.accounts.to ? data.accounts.to.id : 0));
    Promise.all(promises)
      .then(accounts => {
        data.accounts.from = accounts[0];
        data.accounts.to = accounts[1];
        return resolve();
      })
      .catch(err => reject(err));
  });
};

const checkFinImpact = (data, trans) => {
  return new Promise(resolve => {
    let finImpact = false;
    if (trans.amount != data.amount) {
      finImpact = true;
    } else if (trans.accounts.from.id != data.accounts.from.id) {
      finImpact = true;
    } else if (trans.adjust && trans.accounts.to.id != data.accounts.to.id) {
      finImpact = true;
    }
    return resolve(finImpact);
  });
};

// step 4: check if there is any change in bill & if a modification to bill is needed.
const checkBillChangeNeeded = (data, trans) => {
  return new Promise(resolve => {
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
    return resolve(billChange);
  });
};

const modifyBillBalance = (parms, data, tr, billChange) => {
  return new Promise((resolve, reject) => {
    if (!billChange) {
      return resolve();
    }
    const promises = [];
    // reverse the trans balance & add the 'data' balance.
    if (tr.bill) {
      promises.push(
        bills.findOneAndUpdate(parms.db, { id: tr.bill.id }, { $inc: { amount: -tr.amount, balance: -tr.amount } })
      );
    }
    if (data.bill) {
      promises.push(
        bills.findOneAndUpdate(parms.db, { id: data.bill.id }, { $inc: { amount: data.amount, balance: data.amount } })
      );
    }
    Promise.all(promises)
      .then(() => resolve())
      .catch(err => reject(err));
  });
};

const adjustCash = (parms, data, trans, finImpact) => {
  return new Promise((resolve, reject) => {
    if (!finImpact) {
      return resolve();
    }
    // reverse the from / to accounts to reverse cash first.
    transferCash({
      db: parms.db,
      from: trans.accounts.to,
      to: trans.accounts.from,
      amount: trans.amount,
      seq: trans.seq
    })
      .then(() => {
        return transferCash({
          db: parms.db,
          from: data.accounts.from,
          to: data.accounts.to,
          amount: data.amount,
          seq: data.seq
        });
      })
      .then(() => resolve())
      .catch(err => reject(err));
  });
};

// step 2: copy transaction data from input to transaction record.
const copyTransData = (data, trans) => {
  return new Promise(resolve => {
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
    return resolve();
  });
};

const calcTransAcctBal = (parms, data, trans, finImpact) => {
  return new Promise((resolve, reject) => {
    if (!finImpact) {
      return resolve();
    }
    const promises = [];
    promises.push(calcTransAcctBalAc(parms, trans, trans.accounts.from, data.accounts.from.cash));
    promises.push(calcTransAcctBalAc(parms, trans, trans.accounts.to, data.accounts.to.cash));
    Promise.all(promises)
      .then(() => resolve())
      .catch(err => reject(err));
  });
};

const calcTransAcctBalAc = (parms, trans, acct, cash) => {
  return new Promise((resolve, reject) => {
    if (!acct.id) {
      return resolve();
    }
    transactions
      .findPrevious(parms.db, trans.cityId, acct.id, trans.seq)
      .then(prev => {
        if (acct.id === prev.accounts.from.id) {
          acct.balanceBf = prev.accounts.from.balanceAf;
        } else if (acct.id === prev.accounts.to.id) {
          acct.balanceBf = prev.accounts.to.balanceAf;
        }
        const amt = cash ? trans.amount : trans.amount * -1;
        acct.balanceAf = acct.balanceBf - amt;
        return resolve();
      })
      .catch(err => reject(err));
  });
};
