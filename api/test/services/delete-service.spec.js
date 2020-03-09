/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';
import _ from 'lodash';
import moment from 'moment';
import { should, use, expect } from 'chai';

import { accounts, bills, transactions } from '../../models/index';

import { addExpense } from '../../services/add-service';
import { deleteExpense } from '../../services/delete-service';
import { ping } from '../../config/mongodb-config.js';
import format from '../../config/formats';

should();
use(require('chai-things'));

// ====================== Reusable Functions ======================//
const fetchData = async (db, transId, data) => {
  data.trans = await transactions.findById(db, transId);
  data.accounts.from = await accounts.findById(db, data.trans.accounts.from.id);
  data.accounts.to = await accounts.findById(db, data.trans.accounts.to.id);
  if (!data.trans.adjust && data.trans.bill) {
    data.bill = await bills.findById(db, data.trans.bill.id);
  }
};

const reInsertTrans = async (db, data) => {
  const form = {
    city: { id: data.trans.cityId },
    adjust: data.trans.adjust,
    adhoc: data.trans.adhoc,
    category: { id: data.trans.category.id, name: data.trans.category.name },
    description: { name: data.trans.description },
    amount: data.trans.amount,
    transDt: moment(data.trans.transDt, format.YYYYMMDD).format(format.DDMMMYYYY),
    accounts: {
      from: { id: data.accounts.from ? data.accounts.from.id : 0 },
      to: { id: data.accounts.to ? data.accounts.to.id : 0 }
    }
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
    tallyDt: data.trans.tallyDt
  };

  await transactions.findOneAndUpdate(db, { id: tran.id }, { $set: mod1 });
  const fromAc = await accounts.findById(db, data.accounts.from.id);
  const fromBalance = range(data.accounts.from.balance);
  expect(fromAc.balance).to.be.within(fromBalance.low, fromBalance.high);
  const toAc = await accounts.findById(db, data.accounts.to.id);
  if (data.accounts.to.id) {
    const toBalance = range(data.accounts.to.balance);
    expect(toAc.balance).to.be.within(toBalance.low, toBalance.high);
  }
  if (data.bill) {
    const mod2 = { 'bill.id': data.bill.id, 'bill.billDt': data.bill.billDt, 'bill.name': data.bill.name };
    await transactions.findOneAndUpdate(db, { id: data.trans.id }, { $set: mod2 });
    const mod3 = { amount: data.trans.amount, balance: data.trans.amount };
    await bills.findOneAndUpdate(db, { id: data.bill.id }, { $inc: mod3 });
    const bill = await bills.findById(db, data.bill.id);
    const billAmount = range(data.bill.amount);
    const billBalance = range(data.bill.balance);
    expect(bill.amount).to.be.within(billAmount.low, billAmount.high);
    expect(bill.balance).to.be.within(billBalance.low, billBalance.high);
  }
};

const range = value => {
  const rounded = _.round(value, 2);
  return {
    low: rounded - 0.01,
    high: rounded + 0.01
  };
};

// ====================== Test Cases ======================//
describe('services.deleteService', () => {
  let db = null;

  before('get db connection', done => {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('deleteExpense', () => {
    // case #0
    describe('delete expense for an inactive city', () => {
      const transId = 3169;
      let deleted = false;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null
      };

      before('fetch trans details', async () => {
        await fetchData(db, transId, data);
      });
      it('should throw an error for delete transaction with inactive city', async () => {
        try {
          await deleteExpense({ db: db, transId: transId, log: { error: () => {} } });
          deleted = true;
          expect.fail('ok', 'error', 'Exception not thrown in the delete expense with inactive city');
        } catch (err) {
          expect(err.message).to.equal('City is not active.');
        }
      });
      after('add the deleted expense', done => {
        if (!deleted) {
          done();
        } else {
          reInsertTrans(db, data, done);
        }
      });
    });
    // case #1
    describe('delete expense - inactive account', () => {
      const transId = 7931;
      let deleted = false;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null
      };

      before('fetch trans details', async () => {
        await fetchData(db, transId, data);
      });
      it('should throw an error for delete transaction with inactive account', async () => {
        try {
          await deleteExpense({ db: db, transId: transId, log: { error: () => {} } });
          deleted = true;
          expect.fail('ok', 'error', 'Exception not thrown in the delete expense with inactive account.');
        } catch (err) {
          expect(err.message).to.equal('Change invalid. Account(s) involved are not active...');
        }
      });
      after('add the deleted expense', done => {
        if (!deleted) {
          done();
        } else {
          reInsertTrans(db, data, done);
        }
      });
    });
    // case #2
    describe('delete expense - one account inactive', () => {
      const transId = 7838;
      let deleted = false;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null
      };

      before('fetch trans details', async () => {
        await fetchData(db, transId, data);
      });
      it('should throw an error for delete transaction with one inactive account', async () => {
        try {
          await deleteExpense({ db: db, transId: transId, log: { error: () => {} } });
          deleted = true;
          expect.fail('ok', 'error', 'Exception not thrown in the delete expense with one inactive account.');
        } catch (err) {
          expect(err.message).to.equal('Change invalid. Account(s) involved are not active...');
        }
      });
      after('add the deleted expense', done => {
        if (!deleted) {
          done();
        } else {
          reInsertTrans(db, data, done);
        }
      });
    });
    // case #3
    describe('delete expense - positive amount', () => {
      const transId = 5601;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null
      };

      before('fetch trans details', done => {
        fetchData(db, transId, data)
          .then(() => done())
          .catch(err => done(err));
      });
      it('should delete expense with positive amount', async () => {
        await deleteExpense({ db: db, transId: transId, log: { error: () => {} } });
        const tr = await transactions.findById(db, transId);
        expect(tr).to.be.null;
        const ac = await accounts.findById(db, data.accounts.from.id);
        expect(ac).to.have.property('balance', data.accounts.from.balance - data.trans.amount);

        if (!data.trans.adjust && data.trans.bill) {
          const bill = await bills.findById(db, data.bill.id);
          expect(bill).to.have.property('amount', data.bill.amount - data.trans.amount);
          expect(bill).to.have.property('balance', data.bill.balance - data.trans.amount);
        }
        await reInsertTrans(db, data);
      });
    });
    // case #4
    describe('delete expense - negative amount', () => {
      const transId = 5611;
      let deleted = false;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null
      };

      before('fetch trans details', done => {
        fetchData(db, transId, data)
          .then(() => done())
          .catch(err => done(err));
      });
      it('should delete expense with negative amount', async () => {
        await deleteExpense({ db: db, transId: transId, log: { error: () => {} } });
        const tr = await transactions.findById(db, transId);
        expect(tr).to.be.null;
        const ac = await accounts.findById(db, data.accounts.from.id);
        expect(ac).to.have.property('balance', data.accounts.from.balance - data.trans.amount);
        if (!data.trans.adjust && data.trans.bill) {
          const bill = await bills.findById(db, data.bill.id);
          expect(bill).to.have.property('amount', data.bill.amount - data.trans.amount);
          expect(bill).to.have.property('balance', data.bill.balance - data.trans.amount);
        }
        await reInsertTrans(db, data);
      });
    });
    // case #6
    describe('delete expense - open bill', () => {
      const transId = 6983;
      let deleted = false;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null
      };

      before('fetch trans details', done => {
        fetchData(db, transId, data)
          .then(() => done())
          .catch(err => done(err));
      });
      it('should delete expense with open bill', async () => {
        await deleteExpense({ db: db, transId: transId, log: { error: () => {} } });
        const tr = await transactions.findById(db, transId);
        expect(tr).to.be.null;
        const ac = await accounts.findById(db, data.accounts.from.id);
        expect(ac).to.have.property('balance', data.accounts.from.balance - data.trans.amount);
        if (!data.trans.adjust && data.trans.bill) {
          const bill = await bills.findById(db, data.bill.id);
          expect(bill).to.have.property('amount', data.bill.amount - data.trans.amount);
          expect(bill).to.have.property('balance', data.bill.balance - data.trans.amount);
        }
        await reInsertTrans(db, data);
      });
    });
    // case #7
    describe('delete expense - adjustment', () => {
      const transId = 6073;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null
      };

      before('fetch trans details', done => {
        fetchData(db, transId, data)
          .then(() => done())
          .catch(err => done(err));
      });
      it('should delete adjustment expense', async () => {
        await deleteExpense({ db: db, transId: transId, log: { error: () => {} } });
        const tr = await transactions.findById(db, transId);
        expect(tr).to.be.null;
        const fromAc = await accounts.findById(db, data.accounts.from.id);
        expect(fromAc).to.have.property('balance', data.accounts.from.balance + data.trans.amount);
        const toAc = await accounts.findById(db, data.accounts.to.id);
        expect(toAc).to.have.property('balance', data.accounts.to.balance + data.trans.amount);
        if (!data.trans.adjust && data.trans.bill) {
          const bill = await bills.findById(db, data.bill.id);
          expect(bill).to.have.property('amount', data.bill.amount - data.trans.amount);
          expect(bill).to.have.property('balance', data.bill.balance - data.trans.amount);
        }
        await reInsertTrans(db, data);
      });
    });
  });
  after('close db connection', function() {
    // do nothing.
  });
});
