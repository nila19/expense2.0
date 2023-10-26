'use strict';

import _ from 'lodash';
import moment from 'moment';

import { COLLECTION, FORMAT } from 'config/constants';

import { sequenceModel } from 'data/models';
import { accountService, billService, transactionService } from 'data/services';

import { buildBillName } from 'utils/common-utils';

export const closeBill = async ({ db }, data) => {
  const bill = await billService.findById(db, data.id);
  // close only if the billDt is in the past.
  if (moment().isBefore(bill.billDt, 'day')) {
    throw new Error('Bill cannot be closed before bill date.');
  }

  await closeOldBill(db, bill);
  const acct = await accountService.findById(db, bill.account.id);
  await createNewBill(db, bill.cityId, acct);
};

// step 2.2: close each bill.
const closeOldBill = async (db, bill) => {
  const acct = await accountService.findById(db, bill.account.id);
  const trans = await transactionService.findForBill(db, bill.cityId, bill.id);
  let totalAmt = 0;
  trans.forEach((tran) => (totalAmt += tran.amount));
  totalAmt = acct.cash ? totalAmt * -1 : totalAmt;
  totalAmt = _.round(totalAmt, 2);

  await billService.closeBill(db, bill.id, totalAmt);
  await accountService.updateLastBill(db, bill.account.id, { id: bill.id, name: bill.name });
};

// step 3.3: create a new OpenBill..
const createNewBill = async (db, cityId, ac) => {
  // use default id of -1, if the bill obj is null.
  const billId = ac.bills && ac.bills.open ? ac.bills.open.id : -1;
  const bill = await billService.findById(db, billId);

  if (isNewBillNeeded(ac, bill)) {
    const seq = await sequenceModel.findNextSeq(db, cityId, COLLECTION.BILL);
    const newBill = buildEmptyBill(cityId, ac, seq);
    await billService.addBill(db, newBill);
    await accountService.updateOpenBill(db, ac.id, { id: newBill.id, name: newBill.name });
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
const buildEmptyBill = (cityId, ac, seq) => {
  let billDt = moment().date(ac.closingDay);
  // if billDt is in the past, add 1 month.
  billDt = moment().isAfter(billDt, 'day') ? billDt.add(1, 'month') : billDt;
  let dueDt = billDt.clone().date(ac.dueDay);
  // if dueDt is lesser than billDt, add 1 month.
  dueDt = billDt.isAfter(dueDt, 'day') ? dueDt.add(1, 'month') : dueDt;
  const bill = {
    id: seq,
    cityId: cityId,
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
