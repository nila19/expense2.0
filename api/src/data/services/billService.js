import { billModel } from 'data/models';

export const findById = async (db, id) => {
  return billModel.findById(db, id);
};

export const findForCity = async (db, cityId, open) => {
  return billModel.findForCity(db, cityId, open);
};

export const addBill = async (db, bill) => {
  return billModel.insertOne(db, bill);
};

export const incrementBillAmt = (db, id, amount) => {
  return billModel.findOneAndUpdate(db, { id }, { $inc: { amount: amount, balance: amount } });
};

export const closeBill = (db, id, amount) => {
  return billModel.findOneAndUpdate(db, { id }, { $set: { amount: amount, balance: amount, closed: true } });
};

export const addPayment = (db, id, balance, payment) => {
  return billModel.findOneAndUpdate(db, { id }, { $set: { balance: balance }, $push: { payments: payment } });
};

export const deletePayment = (db, id, balance) => {
  return billModel.findOneAndUpdate(db, { id }, { $inc: { balance: balance }, $pop: { payments: 1 } });
};
