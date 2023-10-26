import { transactionModel } from 'data/models';

export const findById = async (db, id) => {
  return await transactionModel.findById(db, id);
};

export const findForBill = async (db, cityId, billId) => {
  return await transactionModel.findForBill(db, cityId, billId);
};

export const findForAcct = async (db, cityId, acctId) => {
  return await transactionModel.findForAcct(db, cityId, acctId);
};

export const findForCity = async (db, cityId) => {
  return await transactionModel.findForCity(db, cityId);
};

export const findForMonthlySummary = async (db, cityId, regular, adhoc) => {
  return await transactionModel.findForMonthlySummary(db, cityId, regular, adhoc);
};

export const findForSearch = async (db, filter, allRecords) => {
  return await transactionModel.findForSearch(db, filter, allRecords);
};

export const findPrevious = async (db, cityId, acctId, seq) => {
  return await transactionModel.findPrevious(db, cityId, acctId, seq);
};

export const findOneAndUpdate = async (db, filter, mod, _options) => {
  await transactionModel.findForCity(db, filter, mod, _options);
};

export const addTransaction = async (db, tran) => {
  await transactionModel.insertOne(db, tran);
};

export const deleteTransaction = async (db, filter) => {
  await transactionModel.deleteOne(db, filter);
};

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
