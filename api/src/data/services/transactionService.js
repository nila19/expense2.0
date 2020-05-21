import { transactionModel } from 'data/models';

export const updateTallyInfo = async (db, account, tallyDt) => {
  const trans = await transactionModel.findNotTallied(db, account.cityId, account.id);
  const p0 = trans.map(async (tran) => {
    return transactionModel.findOneAndUpdate(db, { id: tran.id }, { $set: { tallied: true, tallyDt: tallyDt } });
  });
  await Promise.all(p0);
};

export const updateBalanceAf = (db, tranId, fromAcBal, toAcBal) => {
  return transactionModel.findOneAndUpdate(
    db,
    { id: tranId },
    {
      $set: {
        'accounts.from.balanceAf': fromAcBal,
        'accounts.to.balanceAf': toAcBal,
      },
    }
  );
};

export const updateBalances = async (db, tran) => {
  await transactionModel.findOneAndUpdate(
    db,
    { id: tran.id },
    {
      $set: {
        'accounts.from.balanceBf': tran.accounts.from.balanceBf,
        'accounts.from.balanceAf': tran.accounts.from.balanceAf,
        'accounts.to.balanceBf': tran.accounts.to.balanceBf,
        'accounts.to.balanceAf': tran.accounts.to.balanceAf,
        seq: tran.seq,
      },
    }
  );
};

export const modifyTransaction = (db, tran) => {
  const filter = { cityId: tran.cityId, id: tran.id };
  const mod = {
    $set: {
      category: tran.category,
      description: tran.description,
      amount: tran.amount,
      transDt: tran.transDt,
      transMonth: tran.transMonth,
      transYear: tran.transYear,
      adhoc: tran.adhoc,
      adjust: tran.adjust,
      tallied: tran.tallied,
      tallyDt: tran.tallyDt,
      accounts: tran.accounts,
    },
  };
  if (tran.bill) {
    mod.$set.bill = tran.bill;
  } else {
    mod.$unset = { bill: '' };
  }
  return transactionModel.findOneAndUpdate(db, filter, mod);
};
