'use strict';

import _ from 'lodash';
import moment from 'moment';

import { FORMAT } from 'config/formats';
import { accountModel, billModel, cityModel, sequenceModel, transactionModel } from 'models';
import { buildBillName } from 'utils/common-utils';

export const closeBill = async (parms, data) => {
  console.log(JSON.stringify(data));
  const bill = await billModel.findById(parms.db, data.id);
  // close only if the billDt is in the past.
  if (moment().isSameOrBefore(bill.billDt, 'day')) {
    throw new Error('Bill cannot be closed before bill date.');
  }

  await closeOldBill(parms, bill);
  console.log(JSON.stringify(bill));
  const city = await cityModel.findById(parms.db, bill.cityId);
  const acct = await accountModel.findById(parms.db, bill.account.id);
  await createNewBill(parms, city, acct);
};

// step 2.2: close each bill.
const closeOldBill = async (parms, bill) => {
  let totalAmt = 0;
  const acct = await accountModel.findById(parms.db, bill.account.id);
  const trans = await transactionModel.findForBill(parms.db, bill.cityId, bill.id);
  trans.forEach((tran) => (totalAmt += tran.amount));
  totalAmt = _.round(totalAmt, 2);
  bill.amount = acct.cash ? totalAmt * -1 : totalAmt;

  console.log(bill.amount);
  await billModel.findOneAndUpdate(
    parms.db,
    { id: bill.id },
    { $set: { amount: bill.amount, balance: bill.amount, closed: true } }
  );
  await accountModel.findOneAndUpdate(
    parms.db,
    { id: bill.account.id },
    { $set: { 'bills.last': { id: bill.id, name: bill.name } } }
  );
  console.log(bill.amount);
};

// step 3.3: create a new OpenBill..
const createNewBill = async (parms, city, ac) => {
  // use default id of -1, if the bill obj is null.
  const billId = ac.bills && ac.bills.open ? ac.bills.open.id : -1;
  const bill = await billModel.findById(parms.db, billId);

  if (isNewBillNeeded(ac, bill)) {
    const seq = await sequenceModel.findOneAndUpdate(parms.db, { table: 'bills', cityId: city.id });
    const newBill = buildEmptyBill(city, ac, seq.value.seq);
    await billModel.insertOne(parms.db, newBill);
    await accountModel.findOneAndUpdate(
      parms.db,
      { id: ac.id },
      { $set: { 'bills.open': { id: newBill.id, name: newBill.name } } }
    );
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
    // if the 'openbill' on the account is closed, new bill IS needed.
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
    createdDt: moment().format(FORMAT.YYYYMMDDHHmmss),
    billDt: billDt.format(FORMAT.YYYYMMDD),
    dueDt: dueDt.format(FORMAT.YYYYMMDD),
    closed: false,
    amount: 0,
    balance: 0,
    payments: [],
  };
  bill.name = buildBillName(bill.account, bill);
  return bill;
};
