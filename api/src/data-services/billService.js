import { billModel } from 'models';

export const incrementBillAmt = (db, id, amount) => {
  return billModel.findOneAndUpdate(db, { id }, { $inc: { amount: amount, balance: amount } });
};

export const closeBill = (db, id, amount) => {
  return billModel.findOneAndUpdate(db, { id }, { $set: { amount: amount, balance: amount, closed: true } });
};

export const addPayment = (db, id, balance, payment) => {
  return billModel.findOneAndUpdate(db, { id }, { $set: { balance: balance }, $push: { payments: payment } });
};
