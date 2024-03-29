'use strict';

import { billService, transactionService } from 'data/services';

import { transferCash } from 'services/cash-service';
import { removeFromLookups } from 'services/lookup-services';

import { checkCityEditable, checkAccountsActive, fetchAccounts } from 'utils/common-utils';

export const deleteExpense = async ({ db, transId }) => {
  const tran = await transactionService.findById(db, transId);
  await checkCityEditable(db, tran.cityId);
  const { from, to } = await fetchAccounts(db, tran.accounts);
  checkAccountsActive({ from, to });

  // reverse the from / to accounts to reverse cash.
  await transferCash({ db: db, from: to, to: from, amount: tran.amount, seq: tran.seq });
  if (tran.bill?.id) {
    await billService.incrementBillAmt(db, tran.bill.id, -tran.amount);
  }

  // reset bill when bill-pay transaction is deleted
  if (tran.billPay?.pay) {
    await billService.deletePayment(db, tran.billPay.billId, tran.amount);
  }

  await transactionService.deleteTransaction(db, { id: transId });

  // undo lookup / summary tables for old values
  await removeFromLookups(db, tran);
};
