/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';

import _ from 'lodash';
import { should, use, expect } from 'chai';
import 'regenerator-runtime/runtime.js';

import { ping } from 'config/mongodb-config';
import { accountModel, billModel, transactionModel } from 'models';
import { addExpense } from 'services/expense/add-service';
import { deleteExpense } from 'services/expense/delete-service';

should();
use(require('chai-things'));

// ====================== Reusable Functions ======================//
const fetchData = async (db, transId, data) => {
  data.trans = await transactionModel.findById(db, transId);
  data.accounts.from = await accountModel.findById(db, data.trans.accounts.from.id);
  data.accounts.to = await accountModel.findById(db, data.trans.accounts.to.id);
  if (!data.trans.adjust && data.trans.bill) {
    data.bill = await billModel.findById(db, data.trans.bill.id);
  }
};

const reInsertTrans = async (db, data) => {
  const form = {
    cityId: data.trans.cityId,
    adjust: data.trans.adjust,
    adhoc: data.trans.adhoc,
    category: { id: data.trans.category.id, name: data.trans.category.name },
    description: data.trans.description,
    amount: data.trans.amount,
    transDt: data.trans.transDt,
    accounts: {
      from: { id: data.accounts.from ? data.accounts.from.id : 0 },
      to: { id: data.accounts.to ? data.accounts.to.id : 0 },
    },
  };

  const tran = await addExpense({ db: db, log: { error: () => {} } }, form);

  const mod1 = {
    id: data.trans.id,
    seq: data.trans.seq,
    'accounts.from.balanceBf': data.trans.accounts.from.balanceBf,
    'accounts.from.balanceAf': data.trans.accounts.from.balanceAf,
    'accounts.to.balanceBf': data.trans.accounts.to.balanceBf,
    'accounts.to.balanceAf': data.trans.accounts.to.balanceAf,
    tallied: data.trans.tallied,
    tallyDt: data.trans.tallyDt,
  };
  await transactionModel.findOneAndUpdate(db, { id: tran.id }, { $set: mod1 });

  const fromAc = await accountModel.findById(db, data.accounts.from.id);
  const fromBalance = range(data.accounts.from.balance);
  expect(fromAc.balance).to.be.within(fromBalance.low, fromBalance.high);

  const toAc = await accountModel.findById(db, data.accounts.to.id);
  if (data.accounts.to.id) {
    const toBalance = range(data.accounts.to.balance);
    expect(toAc.balance).to.be.within(toBalance.low, toBalance.high);
  }

  if (data.bill) {
    const amount = data.trans.amount;

    // remove balance from the default open bill.
    const mod4 = { amount: -amount, balance: -amount };
    await billModel.findOneAndUpdate(db, { id: tran.bill.id }, { $inc: mod4 });

    // set the target bill id.
    const mod2 = {
      'bill.id': data.bill.id,
      'bill.billDt': data.bill.billDt,
      'bill.name': data.bill.name,
    };
    await transactionModel.findOneAndUpdate(db, { id: data.trans.id }, { $set: mod2 });

    // add balance to the target bill.
    const mod3 = { amount: amount, balance: amount };
    await billModel.findOneAndUpdate(db, { id: data.bill.id }, { $inc: mod3 });

    const bill = await billModel.findById(db, data.bill.id);
    const billAmount = range(data.bill.amount);
    const billBalance = range(data.bill.balance);
    expect(bill.amount).to.be.within(billAmount.low, billAmount.high);
    expect(bill.balance).to.be.within(billBalance.low, billBalance.high);
  }
};

const range = (value) => {
  const rounded = _.round(value, 2);
  return {
    low: rounded - 0.01,
    high: rounded + 0.01,
  };
};

const checkBalances = async (db, transId, data) => {
  const tr = await transactionModel.findById(db, transId);
  expect(tr).to.be.null;

  const ac = await accountModel.findById(db, data.accounts.from.id);
  expect(ac).to.have.property('balance', data.accounts.from.balance - data.trans.amount);

  if (!data.trans.adjust && data.trans.bill) {
    const bill = await billModel.findById(db, data.bill.id);
    expect(bill).to.have.property('amount', data.bill.amount - data.trans.amount);
    expect(bill).to.have.property('balance', data.bill.balance - data.trans.amount);
  }
};

// ====================== Test Cases ======================//
describe('services.deleteService', () => {
  let db = null;

  before('get db connection', (done) => {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('deleteExpense', () => {
    // case #0
    describe('delete expense for an inactive city', () => {
      const transId = 3169;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null,
      };

      before('fetch trans details', async () => {
        await fetchData(db, transId, data);
      });
      it('should throw an error for delete transaction with inactive city', async () => {
        try {
          await deleteExpense({ db: db, transId: transId, log: { error: () => {} } });
          expect.fail('ok', 'error', 'Exception not thrown in the delete expense with inactive city');
        } catch (err) {
          expect(err.message).to.equal('City is not active.');
        }
      });
    });
    // case #1
    describe('delete expense - inactive account', () => {
      const transId = 7931;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null,
      };

      before('fetch trans details', async () => {
        await fetchData(db, transId, data);
      });
      it('should throw an error for delete transaction with inactive account', async () => {
        try {
          await deleteExpense({ db: db, transId: transId, log: { error: () => {} } });
          expect.fail('ok', 'error', 'Exception not thrown in the delete expense with inactive account.');
        } catch (err) {
          expect(err.message).to.equal('Change invalid. Account(s) involved are not active...');
        }
      });
    });
    // case #2
    describe('delete expense - one account inactive', () => {
      const transId = 7838;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null,
      };

      before('fetch trans details', async () => {
        await fetchData(db, transId, data);
      });
      it('should throw an error for delete transaction with one inactive account', async () => {
        try {
          await deleteExpense({ db: db, transId: transId, log: { error: () => {} } });
          expect.fail('ok', 'error', 'Exception not thrown in the delete expense with one inactive account.');
        } catch (err) {
          expect(err.message).to.equal('Change invalid. Account(s) involved are not active...');
        }
      });
    });
    // case #3
    describe('delete expense - positive amount', () => {
      const transId = 10875;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null,
      };

      before('fetch trans details', async () => {
        await fetchData(db, transId, data);
      });
      it('should delete expense with positive amount', async () => {
        await deleteExpense({ db: db, transId: transId, log: { error: () => {} } });
        await checkBalances(db, transId, data);
        await reInsertTrans(db, data);
      });
    });
    // case #4
    describe('delete expense - negative amount', () => {
      const transId = 10943;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null,
      };

      before('fetch trans details', async () => {
        await fetchData(db, transId, data);
      });
      it('should delete expense with negative amount', async () => {
        await deleteExpense({ db: db, transId: transId, log: { error: () => {} } });
        await checkBalances(db, transId, data);
        await reInsertTrans(db, data);
      });
    });
    // case #6
    describe('delete expense - open bill', () => {
      const transId = 10944;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null,
      };

      before('fetch trans details', async () => {
        await fetchData(db, transId, data);
      });
      it('should delete expense with open bill', async () => {
        await deleteExpense({ db: db, transId: transId, log: { error: () => {} } });
        await checkBalances(db, transId, data);
        await reInsertTrans(db, data);
      });
    });
    // case #7
    describe('delete expense - adjustment', () => {
      const transId = 10887;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null,
      };

      before('fetch trans details', async () => {
        await fetchData(db, transId, data);
      });
      it('should delete adjustment expense', async () => {
        await deleteExpense({ db: db, transId: transId, log: { error: () => {} } });

        const tr = await transactionModel.findById(db, transId);
        expect(tr).to.be.null;

        const fromAc = await accountModel.findById(db, data.accounts.from.id);
        expect(fromAc).to.have.property('balance', data.accounts.from.balance + data.trans.amount);

        const toAc = await accountModel.findById(db, data.accounts.to.id);
        expect(toAc).to.have.property('balance', data.accounts.to.balance + data.trans.amount);

        if (!data.trans.adjust && data.trans.bill) {
          const bill = await billModel.findById(db, data.bill.id);
          expect(bill).to.have.property('amount', data.bill.amount - data.trans.amount);
          expect(bill).to.have.property('balance', data.bill.balance - data.trans.amount);
        }

        await reInsertTrans(db, data);
      });
    });
  });
  after('close db connection', function () {
    // do nothing.
  });
});
