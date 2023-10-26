import { accountModel } from 'data/models';
import { billService } from 'data/services';

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

export const findAll = async (db) => {
  return accountModel.findAll(db);
};

export const findForCity = async (db, cityId) => {
  return accountModel.findForCity(db, cityId, true);
};

export const findAllForCity = async (db, cityId) => {
  return accountModel.findForCity(db, cityId);
};

export const addAcct = async (db, cityId, acct) => {
  return accountModel.insertOne(db, { ...acct, cityId: cityId });
};

export const modifyAcct = (db, cityId, acct) => {
  const filter = { cityId: cityId, id: acct.id };
  const mod = {
    $set: {
      name: acct.name,
      cash: acct.cash,
      billed: acct.billed,
      icon: acct.icon,
      color: acct.color,
      seq: acct.seq,
      closingDay: acct.closingDay,
      dueDay: acct.dueDay,
      balance: acct.balance,
      active: acct.active,
    },
  };
  return accountModel.findOneAndUpdate(db, filter, mod);
};

const _injectLastBill = async (db, acct) => {
  if (acct && acct.billed && acct.bills.last?.id) {
    acct.bills.last = await billService.findById(db, acct.bills.last.id);
  }
};

const _injectOpenBill = async (db, acct) => {
  if (acct && acct.billed && acct.bills.open?.id) {
    acct.bills.open = await billService.findById(db, acct.bills.open.id);
  }
};
