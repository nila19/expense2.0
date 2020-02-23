'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const moment = require('moment');
const sugar = require('sugar/string');
const accounts = require('../models/Accounts')();
const bills = require('../models/Bills')();
const transactions = require('../models/Transactions')();
const cashService = require('./CashService');
const fmt = require('../config/formats');
const cu = require('../utils/common-utils');

const modifyExpense = function (parms, data, next) {
  let tr = null;
  let finImpact = null;
  let billChange = null;

  data.amount = _.toNumber(data.amount);
  transactions.findById(parms.db, data.id).then((tran) => {
    tr = tran;
    return cu.checkCityEditable(parms.db, tr.cityId);
  }).then(() => {
    return getAccountsInfo(parms, data);
  }).then(() => {
    return checkFinImpact(data, tr);
  }).then((fi) => {
    finImpact = fi;
    return cu.checkAccountsActive(finImpact, data.accounts.from, data.accounts.to);
  }).then(() => {
    return checkBillChangeNeeded(data, tr);
  }).then((bc) => {
    billChange = bc;
    return modifyBillBalance(parms, data, tr, billChange);
  }).then(() => {
    return adjustCash(parms, data, tr, finImpact);
  }).then(() => {
    return copyTransData(data, tr);
  }).then(() => {
    return calcTransAcctBal(parms, data, tr, finImpact);
  }).then(() => {
    return transactions.updateTrans(parms.db, tr);
  }).then(() => {
    return next();
  }).catch((err) => {
    cu.logErr(parms.log, err);
    return next(err);
  });
};

const getAccountsInfo = function (parms, data) {
  return new Promise(function (resolve, reject) {
    const promises = [];

    promises.push(accounts.findById(parms.db, data.accounts.from ? data.accounts.from.id: 0));
    promises.push(accounts.findById(parms.db, data.accounts.to ? data.accounts.to.id: 0));
    Promise.all(promises).then((accounts) => {
      data.accounts.from = accounts[0];
      data.accounts.to = accounts[1];
      return resolve();
    }).catch((err) => {
      return reject(err);
    });
  });
};

const checkFinImpact = function (data, trans) {
  return new Promise(function (resolve) {
    let finImpact = false;

    if(trans.amount != data.amount) {
      finImpact = true;
    } else if(trans.accounts.from.id != data.accounts.from.id) {
      finImpact = true;
    } else if(trans.adjust && trans.accounts.to.id != data.accounts.to.id) {
      finImpact = true;
    }
    return resolve(finImpact);
  });
};

// step 4: check if there is any change in bill & if a modification to bill is needed.
const checkBillChangeNeeded = function (data, trans) {
  return new Promise(function (resolve) {
    let billChange = false;

    // if no bill before & after change, then skip.
    if(!trans.bill && !data.bill) {
      billChange = false;
    } else if(trans.bill && !data.bill || !trans.bill && data.bill) {
      billChange = true;
    } else if (trans.bill.id !== data.bill.id) {
      billChange = true;
    } else if (trans.amount !== data.amount) {
      billChange = true;
    }
    return resolve(billChange);
  });
};

const modifyBillBalance = function (parms, data, tr, billChange) {
  return new Promise(function (resolve, reject) {
    if(!billChange) {
      return resolve();
    }
    const promises = [];

    // reverse the trans balance & add the 'data' balance.
    if(tr.bill) {
      promises.push(bills.findOneAndUpdate(parms.db, {id: tr.bill.id},
        {$inc: {amount: -tr.amount, balance: -tr.amount}}));
    }
    if(data.bill) {
      promises.push(bills.findOneAndUpdate(parms.db, {id: data.bill.id},
        {$inc: {amount: data.amount, balance: data.amount}}));
    }
    Promise.all(promises).then(() => {
      return resolve();
    }).catch((err) => {
      return reject(err);
    });
  });
};

const adjustCash = function (parms, data, tr, finImpact) {
  return new Promise(function (resolve, reject) {
    if(!finImpact) {
      return resolve();
    }
    // reverse the from / to accounts to reverse cash first.
    cashService.transferCash({db: parms.db, from: tr.accounts.to,
      to: tr.accounts.from, amount: tr.amount, seq: tr.seq}).then(() => {
        return cashService.transferCash({db: parms.db, from: data.accounts.from,
          to: data.accounts.to, amount: data.amount, seq: data.seq});
      }).then(() => {
        return resolve();
      }).catch((err) => {
        return reject(err);
      });
  });
};

// setp 2: copy transaction data from input to transaction record.
const copyTransData = function (data, trans) {
  return new Promise(function (resolve) {
    trans.category = {id: 0, name: ' ~ '};
    if(data.category) {
      trans.category.id = data.category.id;
      trans.category.name = data.category.name;
    }
    delete trans.bill;
    if(data.bill) {
      trans.bill = {
        id: data.bill.id,
        name: data.bill.name,
        account: {id: data.accounts.from.id, name: data.accounts.from.name}
      };
    }
    trans.description = sugar.String(data.description.name || data.description).capitalize(false, true).raw;
    trans.amount = _.toNumber(data.amount);
    if(trans.transDt !== data.transDt) {
      trans.transDt = moment(data.transDt, fmt.DDMMMYYYY).format(fmt.YYYYMMDD);
      trans.transMonth = moment(data.transDt, fmt.DDMMMYYYY).date(1).format(fmt.YYYYMMDD);
    }
    trans.adhoc = data.adhoc;
    trans.adjust = data.adjust;
    trans.tallied = false;
    trans.tallyDt = null;
  // retain the old balanceBf/balanceAf amounts hpoing no finImpact..
  // if finImpact, these will be revised by the next method...
    if(data.accounts.from.id) {
      trans.accounts.from = {
        id: data.accounts.from.id,
        name: data.accounts.from.name,
        balanceBf: trans.accounts.from.balanceBf,
        balanceAf: trans.accounts.from.balanceAf};
    } else {
      trans.accounts.from = {id: 0, name: '', balanceBf: 0, balanceAf: 0};
    }
    if(data.accounts.to.id) {
      trans.accounts.to = {
        id: data.accounts.to.id,
        name: data.accounts.to.name,
        balanceBf: trans.accounts.to.balanceBf,
        balanceAf: trans.accounts.to.balanceAf};
    } else {
      trans.accounts.to = {id: 0, name: '', balanceBf: 0, balanceAf: 0};
    }
    return resolve();
  });
};

const calcTransAcctBal = function (parms, data, trans, finImpact) {
  return new Promise(function (resolve, reject) {
    if(!finImpact) {
      return resolve();
    }
    const promises = [];

    promises.push(calcTransAcctBalAc(parms, trans, trans.accounts.from, data.accounts.from.cash));
    promises.push(calcTransAcctBalAc(parms, trans, trans.accounts.to, data.accounts.to.cash));
    Promise.all(promises).then(() => {
      return resolve();
    }).catch((err) => {
      return reject(err);
    });
  });
};

const calcTransAcctBalAc = function (parms, trans, acct, cash) {
  return new Promise(function (resolve, reject) {
    if(!acct.id) {
      return resolve();
    }
    transactions.findPrevious(parms.db, trans.cityId, acct.id, trans.seq).then((prev) => {
      if(acct.id === prev.accounts.from.id) {
        acct.balanceBf = prev.accounts.from.balanceAf;
      } else if(acct.id === prev.accounts.to.id) {
        acct.balanceBf = prev.accounts.to.balanceAf;
      }
      const amt = cash ? trans.amount : trans.amount * -1;

      acct.balanceAf = acct.balanceBf - amt;
      return resolve();
    }).catch((err) => {
      return reject(err);
    });
  });
};

module.exports = {
  modifyExpense: modifyExpense,
};
