'use strict';

import _ from 'lodash';
import Promise from 'bluebird';
import moment from 'moment';

import { accounts, bills, cities, sequences, transactions } from '../models';

import format from '../config/formats';
import { logErr } from '../utils/common-utils';

// it does not have a callback or does not need to return a promise.
export const execute = parms => {
  const stats = { closed: 0, opened: 0 };
  let _city = null;
  cities
    .findDefault(parms.db)
    .then(city => {
      _city = city;
      return closeBills(parms, _city, stats);
    })
    .then(() => createNewBills(parms, _city, stats))
    .then(() => parms.log.info('BillCloser :: ' + JSON.stringify(stats)))
    .catch(err => logErr(parms.log, err));
};

// step 2: close all open bills.
const closeBills = (parms, city, stats) => {
  return new Promise((resolve, reject) => {
    const promises = [];
    bills
      .findForCityOpen(parms.db, city.id)
      .then(bills => {
        bills.forEach(bill => {
          // close only if the billDt is in the past.
          if (moment().isAfter(bill.billDt, 'day')) {
            promises.push(closeEachBill(parms, bill));
          }
        });
        if (!promises.length) {
          return resolve();
        } else {
          Promise.all(promises)
            .then(() => {
              stats.closed = promises.length;
              return resolve();
            })
            .catch(err => {
              return reject(err);
            });
        }
      })
      .catch(err => reject(err));
  });
};

// step 2.2: close each bill.
const closeEachBill = (parms, bill) => {
  return new Promise((resolve, reject) => {
    let amt = 0;
    transactions
      .findForAcct(parms.db, bill.cityId, bill.account.id, bill.id)
      .then(trans => {
        trans.forEach(tr => (amt += tr.amount));
        amt = _.round(amt, 2);
        return accounts.findById(parms.db, bill.account.id);
      })
      .then(acct => {
        bill.amount = acct.cash ? amt * -1 : amt;
        return bills.update(
          parms.db,
          { id: bill.id },
          { $set: { amount: bill.amount, balance: bill.amount, closed: true } }
        );
      })
      .then(() => {
        return accounts.update(
          parms.db,
          { id: bill.account.id },
          { $set: { 'bills.last': { id: bill.id, name: bill.name } } }
        );
      })
      .then(() => resolve())
      .catch(err => reject(err));
  });
};

// step 3: create new open bills.
const createNewBills = (parms, city, stats) => {
  return new Promise((resolve, reject) => {
    const promises = [];
    accounts
      .findBillable(parms.db, city.id)
      .then(accts => {
        accts.forEach(acct => promises.push(createEachBill(parms, city, acct, stats)));
        if (!promises.length) {
          return resolve();
        } else {
          Promise.all(promises)
            .then(() => {
              return resolve();
            })
            .catch(err => {
              return reject(err);
            });
        }
      })
      .catch(err => reject(err));
  });
};

// step 3.3: create a new OpenBill..
const createEachBill = (parms, city, ac, stats) => {
  return new Promise((resolve, reject) => {
    let _bill = null;
    // use default id of -1, if the bill obj is null.
    const billId = ac.bills && ac.bills.open ? ac.bills.open.id : -1;
    bills
      .findById(parms.db, billId)
      .then(bill => {
        if (!isNewBillNeeded(ac, bill)) {
          return resolve();
        } else {
          sequences
            .getNextSeq(parms.db, { table: 'bills', cityId: city.id })
            .then(seq => {
              return buildEmptyBill(city, ac, seq.seq);
            })
            .then(bill => {
              _bill = bill;
              return bills.insert(parms.db, bill);
            })
            .then(() => {
              return accounts.update(
                parms.db,
                { id: _bill.account.id },
                { $set: { 'bills.open': { id: _bill.id, name: _bill.name } } }
              );
            })
            .then(() => {
              stats.opened += 1;
              return resolve();
            })
            .catch(err => reject(err));
        }
      })
      .catch(err => reject(err));
  });
};

// step 3.2: check if new bill is needed..
const isNewBillNeeded = (ac, bill) => {
  if (!ac.billed) {
    // if the account is not billed, new bill NOT needed.
    return false;
  } else if (!ac.bills.open || !bill) {
    // if the 'openbill' on the account is null, new bill IS needed.
    return true;
  } else if (bill.closed) {
    // if the 'openbill' on the account is not closed, new bill IS needed.
    return true;
  } else {
    return false;
  }
};

// step 3.3.1: build an empty bill..
const buildEmptyBill = (city, ac, seq) => {
  return new Promise(resolve => {
    let dueDt = null;
    let billDt = moment().date(ac.closingDay);
    // if billDt is in the past, add 1 month.
    billDt = moment().isAfter(billDt, 'day') ? billDt.add(1, 'month') : billDt;
    dueDt = billDt.clone().date(ac.dueDay);
    // if dueDt is lesser than billDt, add 1 month.
    dueDt = billDt.isAfter(dueDt, 'day') ? dueDt.add(1, 'month') : dueDt;
    const bill = {
      id: seq,
      cityId: city.id,
      account: { id: ac.id, name: ac.name },
      createdDt: moment().format(format.YYYYMMDDHHmmss),
      billDt: billDt.format(format.YYYYMMDD),
      dueDt: dueDt.format(format.YYYYMMDD),
      closed: false,
      amount: 0,
      balance: 0
    };
    bill.name = bills.getName(bill.account, bill);
    return resolve(bill);
  });
};
