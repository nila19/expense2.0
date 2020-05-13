/* eslint no-magic-numbers: "off" */

'use strict';

import _ from 'lodash';
import moment from 'moment';
import { should, use, expect } from 'chai';
import 'regenerator-runtime/runtime.js';

import { ping } from 'config/mongodb-config';
import { accountModel, transactionModel } from 'models';
import { addExpense } from 'services/expense/add-service';
import { deleteExpense } from 'services/expense/delete-service';

should();
use(require('chai-things'));

const round = (amt) => _.round(amt, 2);

const checkBalances = async (db, amt, fromAcctId, fromAcBalance, toAcctId, toAcBalance) => {
  const fromAc = await accountModel.findById(db, fromAcctId);
  expect(round(fromAc.balance)).to.be.equal(round(fromAcBalance + amt));

  if (toAcctId) {
    const toAc = await accountModel.findById(db, toAcctId);
    expect(round(toAc.balance)).to.be.equal(round(toAcBalance + amt));
  }
};

const dropExpense = async (db, transId, fromAcctId, fromAcBalance, toAcctId, toAcBalance) => {
  await deleteExpense({ db: db, log: console, transId: transId });
  const fromAc = await accountModel.findById(db, fromAcctId);
  expect(round(fromAc.balance)).to.be.equal(round(fromAcBalance));

  if (toAcctId) {
    const toAc = await accountModel.findById(db, toAcctId);
    expect(round(toAc.balance)).to.be.equal(round(toAcBalance));
  }
};

describe('services.addService', () => {
  let db = null;

  before('get db connection', (done) => {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('addExpense', () => {
    // case #0
    describe('add expense with an inactive city', () => {
      const acctId = 68;
      const amt = 100.25;
      const formData = {
        cityId: 20090201,
        adjust: false,
        adhoc: false,
        category: { id: 188 },
        description: { name: 'Mocha testing' },
        amount: amt,
        transDt: '2017-05-15',
        accounts: { from: { id: acctId }, to: null },
      };
      let transId = 0;
      let acBalance = 0;

      before('fetch account balance', async () => {
        const ac = await accountModel.findById(db, acctId);
        acBalance = ac.balance;
      });
      it('should throw an error', async () => {
        try {
          await addExpense({ db: db, log: { error: () => {} } }, formData);
          expect().fail('Exception not thrown in the add expense with inactive city');
        } catch (e) {
          expect(e.message).to.equal('City is not active.');
        }
      });
    });
    // case #1
    describe('add a regular expense', () => {
      const acctId = 68;
      const amt = 100.25;
      const formData = {
        cityId: 20140301,
        adjust: false,
        adhoc: false,
        category: { id: 188, name: 'House ~ School' },
        description: { name: 'Mocha testing' },
        amount: amt,
        transDt: '2017-05-15',
        accounts: { from: { id: acctId }, to: null },
      };
      let transId = 0;
      let acBalance = 0;
      const entryMth = moment().startOf('month').format('YYYY-MM-DD');

      before('fetch account balance', async () => {
        const ac = await accountModel.findById(db, acctId);
        acBalance = ac.balance;
      });
      it('should add a regular expense', async () => {
        const t = await addExpense({ db: db, log: console }, formData);
        transId = t.id;

        const tr = await transactionModel.findById(db, transId);
        expect(tr).to.have.property('id', transId);
        expect(tr).to.have.property('cityId', 20140301);
        expect(tr).to.have.property('entryMonth', entryMth);
        expect(tr.category).to.have.property('id', 188);
        expect(tr).to.have.property('description', 'Mocha Testing');
        expect(tr).to.have.property('amount', amt);
        expect(tr).to.have.property('transDt', '2017-05-15');
        expect(tr).to.have.property('transMonth', '2017-05-01');
        expect(tr).to.have.property('seq', transId);
        expect(tr.accounts.from).to.have.property('id', acctId);
        expect(tr.accounts.from).to.have.property('balanceBf', acBalance);
        expect(tr.accounts.from).to.have.property('balanceAf', acBalance + amt);
        expect(tr.accounts.to).to.have.property('id', 0);
        expect(tr).to.have.property('adjust', false);
        expect(tr).to.have.property('adhoc', false);
        expect(tr).to.have.property('status', true);
        expect(tr).to.have.property('tallied', false);
        expect(tr).to.have.property('tallyDt', null);
        expect(tr.bill.account).to.have.property('id', acctId);

        await checkBalances(db, amt, acctId, acBalance);
        await dropExpense(db, transId, acctId, acBalance);
      });
    });
    // case #2
    describe('add a regular expense - negative amount', () => {
      const acctId = 68;
      const amt = -100.25;
      const formData = {
        cityId: 20140301,
        adjust: false,
        adhoc: false,
        category: { id: 188, name: 'House ~ School' },
        description: { name: 'Mocha testing' },
        amount: amt,
        transDt: '2017-05-15',
        accounts: { from: { id: acctId }, to: null },
      };
      let transId = 0;
      let acBalance = 0;
      const entryMth = moment().startOf('month').format('YYYY-MM-DD');

      before('fetch account balance', async () => {
        const ac = await accountModel.findById(db, acctId);
        acBalance = ac.balance;
      });
      it('should add a regular expense - negative amount', async () => {
        const t = await addExpense({ db: db, log: console }, formData);
        transId = t.id;

        const tr = await transactionModel.findById(db, transId);
        expect(tr).to.have.property('id', transId);
        expect(tr).to.have.property('cityId', 20140301);
        expect(tr).to.have.property('entryMonth', entryMth);
        expect(tr.category).to.have.property('id', 188);
        expect(tr).to.have.property('description', 'Mocha Testing');
        expect(tr).to.have.property('amount', amt);
        expect(tr).to.have.property('transDt', '2017-05-15');
        expect(tr).to.have.property('transMonth', '2017-05-01');
        expect(tr).to.have.property('seq', transId);
        expect(tr.accounts.from).to.have.property('id', acctId);
        expect(tr.accounts.from).to.have.property('balanceBf', acBalance);
        expect(tr.accounts.from).to.have.property('balanceAf', acBalance + amt);
        expect(tr.accounts.to).to.have.property('id', 0);
        expect(tr).to.have.property('adjust', false);
        expect(tr).to.have.property('adhoc', false);
        expect(tr).to.have.property('status', true);
        expect(tr).to.have.property('tallied', false);
        expect(tr).to.have.property('tallyDt', null);
        expect(tr.bill.account).to.have.property('id', acctId);

        await checkBalances(db, amt, acctId, acBalance);
        await dropExpense(db, transId, acctId, acBalance);
      });
    });
  });
  // case #3
  describe('add an adjustment', () => {
    const fromAcctId = 62;
    const toAcctId = 68;
    const amt = 100.25;
    const formData = {
      cityId: 20140301,
      adjust: true,
      adhoc: false,
      category: null,
      description: 'Mocha testing 3',
      amount: amt,
      transDt: '2017-05-20',
      accounts: { from: { id: fromAcctId }, to: { id: toAcctId } },
    };
    let transId = 0;
    let frAcBalance = 0;
    let toAcBalance = 0;
    const entryMth = moment().startOf('month').format('YYYY-MM-DD');

    before('fetch account balance', async () => {
      const fromAc = await accountModel.findById(db, fromAcctId);
      frAcBalance = fromAc.balance;

      const toAc = await accountModel.findById(db, toAcctId);
      toAcBalance = toAc.balance;
    });
    it('should add an adjustment', async () => {
      const t = await addExpense({ db: db, log: console }, formData);
      transId = t.id;

      const tr = await transactionModel.findById(db, transId);
      expect(tr).to.have.property('id', transId);
      expect(tr).to.have.property('cityId', 20140301);
      expect(tr).to.have.property('entryMonth', entryMth);
      expect(tr.category).to.have.property('id', 0);
      expect(tr).to.have.property('description', 'Mocha Testing 3');
      expect(tr).to.have.property('amount', amt);
      expect(tr).to.have.property('transDt', '2017-05-20');
      expect(tr).to.have.property('transMonth', '2017-05-01');
      expect(tr).to.have.property('seq', transId);
      expect(tr.accounts.from).to.have.property('id', fromAcctId);
      expect(tr.accounts.from).to.have.property('balanceBf', frAcBalance);
      expect(tr.accounts.from).to.have.property('balanceAf', frAcBalance - amt);
      expect(tr.accounts.to).to.have.property('id', toAcctId);
      expect(tr.accounts.to).to.have.property('balanceBf', toAcBalance);
      expect(tr.accounts.to).to.have.property('balanceAf', toAcBalance - amt);
      expect(tr).to.have.property('adjust', true);
      expect(tr).to.have.property('adhoc', false);
      expect(tr).to.have.property('status', true);
      expect(tr).to.have.property('tallied', false);
      expect(tr).to.have.property('tallyDt', null);

      await checkBalances(db, amt * -1, fromAcctId, frAcBalance, toAcctId, toAcBalance);
      await dropExpense(db, transId, fromAcctId, frAcBalance, toAcctId, toAcBalance);
    });
  });
  // case #4
  describe('add an adjustment - negative amount', () => {
    const fromAcctId = 62;
    const toAcctId = 68;
    const amt = -100.25;
    const formData = {
      cityId: 20140301,
      adjust: true,
      adhoc: false,
      category: null,
      description: 'Mocha testing 3',
      amount: amt,
      transDt: '2017-05-20',
      accounts: { from: { id: fromAcctId }, to: { id: toAcctId } },
    };
    let transId = 0;
    let frAcBalance = 0;
    let toAcBalance = 0;
    const entryMth = moment().startOf('month').format('YYYY-MM-DD');

    before('fetch account balance', async () => {
      const fromAc = await accountModel.findById(db, fromAcctId);
      frAcBalance = fromAc.balance;

      const toAc = await accountModel.findById(db, toAcctId);
      toAcBalance = toAc.balance;
    });
    it('should add an adjustment - negative amount', async () => {
      const t = await addExpense({ db: db, log: console }, formData);
      transId = t.id;

      const tr = await transactionModel.findById(db, transId);
      expect(tr).to.have.property('id', transId);
      expect(tr).to.have.property('cityId', 20140301);
      expect(tr).to.have.property('entryMonth', entryMth);
      expect(tr.category).to.have.property('id', 0);
      expect(tr).to.have.property('description', 'Mocha Testing 3');
      expect(tr).to.have.property('amount', amt);
      expect(tr).to.have.property('transDt', '2017-05-20');
      expect(tr).to.have.property('transMonth', '2017-05-01');
      expect(tr).to.have.property('seq', transId);
      expect(tr.accounts.from).to.have.property('id', fromAcctId);
      expect(tr.accounts.from).to.have.property('balanceBf', frAcBalance);
      expect(tr.accounts.from).to.have.property('balanceAf', frAcBalance - amt);
      expect(tr.accounts.to).to.have.property('id', toAcctId);
      expect(tr.accounts.to).to.have.property('balanceBf', toAcBalance);
      expect(tr.accounts.to).to.have.property('balanceAf', toAcBalance - amt);
      expect(tr).to.have.property('adjust', true);
      expect(tr).to.have.property('adhoc', false);
      expect(tr).to.have.property('status', true);
      expect(tr).to.have.property('tallied', false);
      expect(tr).to.have.property('tallyDt', null);

      await checkBalances(db, amt * -1, fromAcctId, frAcBalance, toAcctId, toAcBalance);
      await dropExpense(db, transId, fromAcctId, frAcBalance, toAcctId, toAcBalance);
    });
  });
  // case #5
  describe('add an adjustment - fromAccount blank', () => {
    const toAcctId = 68;
    const amt = 100.25;
    const formData = {
      cityId: 20140301,
      adjust: true,
      adhoc: false,
      category: null,
      description: 'Mocha testing 3',
      amount: amt,
      transDt: '2017-05-20',
      accounts: { from: null, to: { id: toAcctId } },
    };
    let transId = 0;
    let toAcBalance = 0;
    const entryMth = moment().startOf('month').format('YYYY-MM-DD');

    before('fetch account balance', async () => {
      const ac = await accountModel.findById(db, toAcctId);
      toAcBalance = ac.balance;
    });
    it('should add an adjustment - fromAccount blank', async () => {
      const t = await addExpense({ db: db, log: console }, formData);
      transId = t.id;

      const tr = await transactionModel.findById(db, transId);
      expect(tr).to.have.property('id', transId);
      expect(tr).to.have.property('cityId', 20140301);
      expect(tr).to.have.property('entryMonth', entryMth);
      expect(tr.category).to.have.property('id', 0);
      expect(tr).to.have.property('description', 'Mocha Testing 3');
      expect(tr).to.have.property('amount', amt);
      expect(tr).to.have.property('transDt', '2017-05-20');
      expect(tr).to.have.property('transMonth', '2017-05-01');
      expect(tr).to.have.property('seq', transId);
      expect(tr.accounts.from).to.have.property('id', 0);
      expect(tr.accounts.to).to.have.property('id', toAcctId);
      expect(tr.accounts.to).to.have.property('balanceBf', toAcBalance);
      expect(tr.accounts.to).to.have.property('balanceAf', toAcBalance - amt);
      expect(tr).to.have.property('adjust', true);
      expect(tr).to.have.property('adhoc', false);
      expect(tr).to.have.property('status', true);
      expect(tr).to.have.property('tallied', false);
      expect(tr).to.have.property('tallyDt', null);

      await checkBalances(db, amt * -1, toAcctId, toAcBalance);
      await dropExpense(db, transId, toAcctId, toAcBalance);
    });
  });
  // case #6
  describe('add an adjustment - toAccount blank', () => {
    const fromAcctId = 62;
    const amt = 100.25;
    const formData = {
      cityId: 20140301,
      adjust: true,
      adhoc: false,
      category: null,
      description: 'Mocha testing 3',
      amount: amt,
      transDt: '2017-05-20',
      accounts: { from: { id: fromAcctId }, to: null },
    };
    let transId = 0;
    let frAcBalance = 0;
    const entryMth = moment().startOf('month').format('YYYY-MM-DD');

    before('fetch account balance', async () => {
      const ac = await accountModel.findById(db, fromAcctId);
      frAcBalance = ac.balance;
    });
    it('should add an adjustment - toAccount blank', async () => {
      const t = await addExpense({ db: db, log: console }, formData);
      transId = t.id;

      const tr = await transactionModel.findById(db, transId);
      expect(tr).to.have.property('id', transId);
      expect(tr).to.have.property('cityId', 20140301);
      expect(tr).to.have.property('entryMonth', entryMth);
      expect(tr.category).to.have.property('id', 0);
      expect(tr).to.have.property('description', 'Mocha Testing 3');
      expect(tr).to.have.property('amount', amt);
      expect(tr).to.have.property('transDt', '2017-05-20');
      expect(tr).to.have.property('transMonth', '2017-05-01');
      expect(tr).to.have.property('seq', transId);
      expect(tr.accounts.from).to.have.property('id', fromAcctId);
      expect(tr.accounts.from).to.have.property('balanceBf', frAcBalance);
      expect(tr.accounts.from).to.have.property('balanceAf', frAcBalance - amt);
      expect(tr.accounts.to).to.have.property('id', 0);
      expect(tr).to.have.property('adjust', true);
      expect(tr).to.have.property('adhoc', false);
      expect(tr).to.have.property('status', true);
      expect(tr).to.have.property('tallied', false);
      expect(tr).to.have.property('tallyDt', null);

      await checkBalances(db, amt * -1, fromAcctId, frAcBalance);
      await dropExpense(db, transId, fromAcctId, frAcBalance);
    });
  });
});
