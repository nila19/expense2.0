'use strict';

import { accountModel, transactionModel } from 'models';

// transfer cash from one account to another
export const transferCash = async (parms) => {
  const fromAcct = await accountModel.findById(parms.db, parms.from.id);
  await updateAccount(parms, fromAcct, parms.amount * -1, parms.seq);

  const toAcct = await accountModel.findById(parms.db, parms.to.id);
  await updateAccount(parms, toAcct, parms.amount, parms.seq);
};

// step 2.1 : update the balance amount into DB.
const updateAccount = async (parms, acct, amount, seq) => {
  // if acct# is 0, ignore.
  if (!acct.id) {
    return;
  }
  const amt = acct.cash ? amount : amount * -1;
  await accountModel.updateOne(parms.db, { id: acct.id }, { $inc: { balance: amt } });
  // if seq = 0, it is an 'add'. ignore the updateTransItemBalances step. that's used only for modify.
  if (seq) {
    await updateTransItemBalances(parms, acct, amt, seq);
  }
};

// step 2.1.1 : find all future trans post this trans & adjust the ac balances.
const updateTransItemBalances = async (parms, acct, amount, seq) => {
  const trans = await transactionModel.findForAcct(parms.db, acct.cityId, acct.id);
  for (const tran of trans) {
    // if seq is less, then it is an earlier transaction, ignore..
    if (tran.seq > seq) {
      if (tran.accounts.from.id === acct.id) {
        tran.accounts.from.balanceBf += amount;
        tran.accounts.from.balanceAf += amount;
      } else if (tran.accounts.to.id === acct.id) {
        tran.accounts.to.balanceBf += amount;
        tran.accounts.to.balanceAf += amount;
      }
      await updateTrans(parms, tran);
    }
  }
};

// step 2.1.1.1 : save the ac balances changes to DB.
const updateTrans = async (parms, tran) => {
  await transactionModel.updateOne(
    parms.db,
    { id: tran.id },
    {
      $set: {
        'accounts.from.balanceBf': tran.accounts.from.balanceBf,
        'accounts.from.balanceAf': tran.accounts.from.balanceAf,
        'accounts.to.balanceBf': tran.accounts.to.balanceBf,
        'accounts.to.balanceAf': tran.accounts.to.balanceAf,
      },
    }
  );
};
