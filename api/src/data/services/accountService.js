import { accountModel, billModel } from 'data/models';

export const updateTallyInfo = (db, account, tallyDt) => {
  return accountModel.findOneAndUpdate(
    db,
    { id: account.id },
    { $set: { tallyBalance: account.balance, tallyDt: tallyDt } }
  );
};

export const incrementBalance = (db, id, amount) => {
  return accountModel.findOneAndUpdate(db, { id }, { $inc: { balance: amount } });
};

export const updateLastBill = (db, id, bill) => {
  return accountModel.findOneAndUpdate(db, { id }, { $set: { 'bills.last': bill } });
};

export const updateOpenBill = (db, id, bill) => {
  return accountModel.findOneAndUpdate(db, { id }, { $set: { 'bills.open': bill } });
};

export const findById = async (db, id) => {
  const acct = await accountModel.findOne(db, { id });
  await _injectLastBill(db, acct);
  await _injectOpenBill(db, acct);
  return acct;
};

const _injectLastBill = async (db, acct) => {
  if (acct.billed && acct.bills.last?.id) {
    acct.bills.last = await billModel.findById(db, acct.bills.last.id);
  }
};

const _injectOpenBill = async (db, acct) => {
  if (acct.billed && acct.bills.open?.id) {
    acct.bills.open = await billModel.findById(db, acct.bills.open.id);
  }
};

// export default { updateTallyInfo };
