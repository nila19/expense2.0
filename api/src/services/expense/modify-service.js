'use strict';

import numeral from 'numeral';

import { billService, transactionService } from 'data/services';

import { transferCash } from 'services/cash-service';
import { addToLookups, removeFromLookups } from 'services/lookup-services';
import { buildTranBasic, buildTranAccountsModify, buildTranBillModify } from 'services/expense/expense-utils';

import { checkCityEditable, checkAccountsActive, fetchAccounts } from 'utils/common-utils';

export const modifyExpense = async ({ db }, data) => {
  data.amount = numeral(data.amount).value();
  const oldTran = await transactionService.findById(db, data.id);

  await checkCityEditable(db, oldTran.cityId);
  const accounts = await fetchAccounts(db, data.accounts);
  const finImpact = checkFinImpact(oldTran, data);
  if (finImpact) {
    checkAccountsActive(accounts);
  }

  // undo lookup / summary tables for old values
  await removeFromLookups(db, oldTran);

  // if the bill # is changed, modify bill balances
  await modifyBillBalance(db, oldTran, data);

  const newTran = buildTran(oldTran, data);
  if (finImpact) {
    await adjustCash(db, oldTran, data);
    await calcTransAcctBalances(db, newTran, accounts);
  }

  await transactionService.modifyTransaction(db, newTran);

  // update lookup / summary tables with new values
  await addToLookups(db, newTran);
};

const checkFinImpact = (tran, data) => {
  let finImpact = false;
  if (tran.amount !== data.amount) {
    finImpact = true;
  } else if (tran.accounts.from?.id !== data.accounts.from?.id) {
    finImpact = true;
  } else if (tran.adjust && tran.accounts.to?.id !== data.accounts.to?.id) {
    finImpact = true;
  }
  return finImpact;
};

const modifyBillBalance = async (db, tran, data) => {
  const billChange = isBillChangeNeeded(tran, data);
  if (!billChange) {
    return;
  }
  // reverse the old amount & add the new amount.
  if (tran.bill?.id) {
    await billService.incrementBillAmt(db, tran.bill.id, -tran.amount);
  }
  if (data.bill?.id) {
    await billService.incrementBillAmt(db, data.bill.id, data.amount);
  }
};

// step 4: check if there is any change in bill & if a modification to bill is needed.
const isBillChangeNeeded = (tran, data) => {
  let billChange = false;
  const tranBillId = tran.bill?.id;
  const dataBillId = data.bill?.id;
  // if no bill before & after change, then skip.
  if (!tranBillId && !dataBillId) {
    billChange = false;
  } else if ((tranBillId && !dataBillId) || (!tranBillId && dataBillId)) {
    billChange = true;
  } else if (tranBillId !== dataBillId) {
    billChange = true;
  } else if (tran.amount !== data.amount) {
    billChange = true;
  }
  return billChange;
};

const adjustCash = async (db, tran, data) => {
  // reverse the from / to accounts to reverse cash first.
  await transferCash({
    db: db,
    from: tran.accounts.to,
    to: tran.accounts.from,
    amount: tran.amount,
    seq: tran.seq,
  });
  await transferCash({
    db: db,
    from: data.accounts.from,
    to: data.accounts.to,
    amount: data.amount,
    seq: data.seq,
  });
};

// step 2: copy transaction data from input to transaction record.
const buildTran = (oldTran, data) => {
  const tranBasic = buildTranBasic(data);
  const tranAccts = buildTranAccountsModify(data.accounts, oldTran);
  const tranBill = buildTranBillModify(data);
  return { ...tranBasic, ...tranAccts, ...tranBill };
};

const calcTransAcctBalances = async (db, tran, { from, to }) => {
  await calcTransAcctBalance(db, tran, tran.accounts.from, from.cash);
  await calcTransAcctBalance(db, tran, tran.accounts.to, to.cash);
};

const calcTransAcctBalance = async (db, tran, acct, cash) => {
  if (!acct.id) {
    return;
  }
  const prev = await transactionService.findPrevious(db, tran.cityId, acct.id, tran.seq);
  if (acct.id === prev.accounts.from.id) {
    acct.balanceBf = prev.accounts.from.balanceAf;
  } else if (acct.id === prev.accounts.to.id) {
    acct.balanceBf = prev.accounts.to.balanceAf;
  }
  const amt = cash ? tran.amount : tran.amount * -1;
  acct.balanceAf = acct.balanceBf - amt;
};
