'use strict';

import { accountModel, transactionModel } from 'models';
import { accountService, transactionService } from 'data-services';

// transfer cash from one account to another
export const transferCash = async ({ db, amount, from, to, seq }) => {
  const fromAcct = await accountModel.findById(db, from.id);
  await updateAccount(db, fromAcct, amount * -1, seq);

  const toAcct = await accountModel.findById(db, to.id);
  await updateAccount(db, toAcct, amount, seq);
};

// step 2.1 : update the balance amount into DB.
const updateAccount = async (db, account, amount, seq) => {
  // if acct# is 0, ignore.
  if (account?.id) {
    const amt = account.cash ? amount : amount * -1;
    await accountService.incrementBalance(db, account.id, amt);
    // if seq = 0, it is an 'add'. ignore the updateTransItemBalances step. that's used only for modify.
    if (seq) {
      await updateTranAcBalances(db, account, amt, seq);
    }
  }
};

// step 2.1.1 : find all future trans post this trans & adjust the ac balances.
const updateTranAcBalances = async (db, account, amount, seq) => {
  const trans = await transactionModel.findForAcct(db, account.cityId, account.id);
  for (const tran of trans) {
    // if seq is less, then it is an earlier transaction, ignore..
    if (tran.seq > seq) {
      if (tran.accounts.from.id === account.id) {
        tran.accounts.from.balanceBf += amount;
        tran.accounts.from.balanceAf += amount;
      } else if (tran.accounts.to.id === account.id) {
        tran.accounts.to.balanceBf += amount;
        tran.accounts.to.balanceAf += amount;
      }
      await transactionService.updateBalances(db, tran);
    }
  }
};
