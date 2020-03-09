'use strict';

import _ from 'lodash';
import moment from 'moment';

import { accounts, bills, cities, sequences, transactions } from '../models';

import format from '../config/formats';

export const executeBillClosure = async parms => {
  const stats = { closed: 0, opened: 0 };
  const city = await cities.findDefault(parms.db);
  await closeBills(parms, city, stats);
  await createNewBills(parms, city, stats);
  parms.log.info('BillCloser :: ' + JSON.stringify(stats));
};

// step 2: close all open bills.
const closeBills = async (parms, city, stats) => {
  const _bills = await bills.findForCityOpen(parms.db, city.id);
  for (const bill of _bills) {
    // close only if the billDt is in the past.
    if (moment().isAfter(bill.billDt, 'day')) {
      await closeEachBill(parms, bill);
      stats.closed += 1;
    }
  }
};

// step 2.2: close each bill.
const closeEachBill = async (parms, bill) => {
  let totalAmt = 0;
  const acct = await accounts.findById(parms.db, bill.account.id);
  const trans = await transactions.findForAcct(parms.db, bill.cityId, bill.account.id, bill.id);
  trans.forEach(tran => (totalAmt += tran.amount));
  totalAmt = _.round(totalAmt, 2);
  bill.amount = acct.cash ? totalAmt * -1 : totalAmt;

  await bills.update(parms.db, { id: bill.id }, { $set: { amount: bill.amount, balance: bill.amount, closed: true } });
  await accounts.update(
    parms.db,
    { id: bill.account.id },
    { $set: { 'bills.last': { id: bill.id, name: bill.name } } }
  );
};

// step 3: create new open bills.
const createNewBills = async (parms, city, stats) => {
  const accts = await accounts.findBillable(parms.db, city.id);
  for (const acct of accts) {
    await createEachBill(parms, city, acct, stats);
  }
};

// step 3.3: create a new OpenBill..
const createEachBill = async (parms, city, ac, stats) => {
  // use default id of -1, if the bill obj is null.
  const billId = ac.bills && ac.bills.open ? ac.bills.open.id : -1;
  const bill = await bills.findById(parms.db, billId);

  if (isNewBillNeeded(ac, bill)) {
    const seq = await sequences.getNextSeq(parms.db, { table: 'bills', cityId: city.id });
    const newBill = buildEmptyBill(city, ac, seq.seq);
    await bills.insert(parms.db, newBill);
    await accounts.update(parms.db, { id: ac.id }, { $set: { 'bills.open': { id: newBill.id, name: newBill.name } } });
    stats.opened += 1;
  }
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
  bill.name = bills.buildBillName(bill.account, bill);
  return bill;
};
