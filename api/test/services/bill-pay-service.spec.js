/* eslint no-magic-numbers: "off" */

'use strict';

import moment from 'moment';
import { should, use, expect } from 'chai';
import 'regenerator-runtime/runtime.js';

import { ping } from 'config/mongodb-config';
import { accountModel, billModel, transactionModel } from 'models';
import { payBill } from 'services/bill-pay-service';
import { deleteExpense } from 'services/delete-service';

should();
use(require('chai-things'));

const checkBillBalances = async (db, form, transId) => {
  const bill = await billModel.findById(db, form.bill.id);
  expect(bill).to.have.property('balance', form.bill.balance - form.paidAmt);
  expect(bill.payments.find((p) => p.id === transId)).to.have.property('amount', form.paidAmt);

  const billAc = await accountModel.findById(db, form.bill.account.id);
  expect(billAc).to.have.property('balance', form.bill.account.balance - form.paidAmt);

  const ac = await accountModel.findById(db, form.account.id);
  expect(ac).to.have.property('balance', form.account.balance - form.paidAmt);
};

const undoPayBill = async (db, form, transId) => {
  await deleteExpense({ db: db, log: console, transId: transId });

  const ac = await accountModel.findById(db, form.account.id);
  expect(ac).to.have.property('balance', form.account.balance);

  const billAc = await accountModel.findById(db, form.bill.account.id);
  expect(billAc).to.have.property('balance', form.bill.account.balance);

  const mod = { $inc: { balance: form.paidAmt }, $pull: { payments: { id: transId } } };
  await billModel.updateOne(db, { id: form.bill.id }, mod);

  const bill = await billModel.findById(db, form.bill.id);
  expect(bill).to.have.property('balance', form.bill.balance);
};

describe('services.billPayService', () => {
  let db = null;

  before('get db connection', (done) => {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('payBill', () => {
    // case #0
    describe('pay bill with an inactive city', () => {
      const form = {
        cityId: 20090201,
        bill: { id: 99, balance: 476.87, account: { id: 60, balance: 0 } },
        account: { id: 62, balance: 0 },
        paidAmt: 50.25,
        paidDt: '2017-05-15',
      };

      before('fetch account balance', async () => {
        const fromAc = await accountModel.findById(db, form.bill.account.id);
        form.bill.account.balance = fromAc.balance;

        const toAc = await accountModel.findById(db, form.account.id);
        form.account.balance = toAc.balance;
      });
      it('should throw an error for pay bill with inactive city', async () => {
        try {
          await payBill({ db: db, log: { error: () => {} } }, form);
          expect().fail('Exception not thrown in the pay bill with inactive city');
        } catch (e) {
          expect(e.message).to.equal('City is not active.');
        }
      });
    });
  });
  // case #1
  describe('make partial payment', () => {
    const form = {
      cityId: 20140301,
      bill: { id: 235, balance: 0, account: { id: 94, balance: 0 } },
      account: { id: 62, balance: 0 },
      paidAmt: 5.25,
      paidDt: '2020-04-07',
    };
    let transId = 0;
    const entryMth = moment().startOf('month').format('YYYY-MM-DD');

    before('fetch account balance', async () => {
      const bill = await billModel.findById(db, form.bill.id);
      form.bill.balance = bill.balance;

      const billAc = await accountModel.findById(db, form.bill.account.id);
      form.bill.account.balance = billAc.balance;

      const payAc = await accountModel.findById(db, form.account.id);
      form.account.balance = payAc.balance;
    });
    it('should make partial payment', async () => {
      const t = await payBill({ db: db, log: console }, form);
      transId = t.id;

      const tr = await transactionModel.findById(db, transId);
      expect(tr).to.have.property('id', transId);
      expect(tr).to.have.property('cityId', 20140301);
      expect(tr).to.have.property('entryMonth', entryMth);
      expect(tr.category).to.have.property('id', 0);
      expect(tr).to.have.property('description', 'Cc Bill Payment');
      expect(tr).to.have.property('amount', form.paidAmt);
      expect(tr).to.have.property('transDt', '2020-04-07');
      expect(tr).to.have.property('transMonth', '2020-04-01');
      expect(tr).to.have.property('seq', transId);
      expect(tr.accounts.from).to.have.property('id', form.account.id);
      expect(tr.accounts.from).to.have.property('balanceBf', form.account.balance);
      expect(tr.accounts.from).to.have.property('balanceAf', form.account.balance - form.paidAmt);
      expect(tr.accounts.to).to.have.property('id', form.bill.account.id);
      expect(tr.accounts.to).to.have.property('balanceBf', form.bill.account.balance);
      expect(tr.accounts.to).to.have.property('balanceAf', form.bill.account.balance - form.paidAmt);
      expect(tr).to.have.property('adjust', true);
      expect(tr).to.have.property('adhoc', false);
      expect(tr).to.have.property('status', true);
      expect(tr).to.have.property('tallied', false);
      expect(tr).to.have.property('tallyDt', null);

      await checkBillBalances(db, form, transId);
      await undoPayBill(db, form, transId);
    });
  });
  // case #2
  describe('make full payment', () => {
    const form = {
      cityId: 20140301,
      bill: { id: 239, balance: 0, account: { id: 83, balance: 0 } },
      account: { id: 62, balance: 0 },
      paidAmt: 0,
      paidDt: '2020-04-07',
    };
    let transId = 0;
    const entryMth = moment().startOf('month').format('YYYY-MM-DD');

    before('fetch account balance', async () => {
      const bill = await billModel.findById(db, form.bill.id);
      form.bill.balance = bill.balance;
      form.paidAmt = bill.balance;

      const billAc = await accountModel.findById(db, form.bill.account.id);
      form.bill.account.balance = billAc.balance;

      const payAc = await accountModel.findById(db, form.account.id);
      form.account.balance = payAc.balance;
    });
    it('should make full payment', async () => {
      const t = await payBill({ db: db, log: console }, form);
      transId = t.id;

      const tr = await transactionModel.findById(db, transId);
      expect(tr).to.have.property('id', transId);
      expect(tr).to.have.property('cityId', 20140301);
      expect(tr).to.have.property('entryMonth', entryMth);
      expect(tr.category).to.have.property('id', 0);
      expect(tr).to.have.property('description', 'Cc Bill Payment');
      expect(tr).to.have.property('amount', form.paidAmt);
      expect(tr).to.have.property('transDt', '2020-04-07');
      expect(tr).to.have.property('transMonth', '2020-04-01');
      expect(tr).to.have.property('seq', transId);
      expect(tr.accounts.from).to.have.property('id', form.account.id);
      expect(tr.accounts.from).to.have.property('balanceBf', form.account.balance);
      expect(tr.accounts.from).to.have.property('balanceAf', form.account.balance - form.paidAmt);
      expect(tr.accounts.to).to.have.property('id', form.bill.account.id);
      expect(tr.accounts.to).to.have.property('balanceBf', form.bill.account.balance);
      expect(tr.accounts.to).to.have.property('balanceAf', form.bill.account.balance - form.paidAmt);
      expect(tr).to.have.property('adjust', true);
      expect(tr).to.have.property('adhoc', false);
      expect(tr).to.have.property('status', true);
      expect(tr).to.have.property('tallied', false);
      expect(tr).to.have.property('tallyDt', null);

      await checkBillBalances(db, form, transId);
      await undoPayBill(db, form, transId);
    });
  });
});
