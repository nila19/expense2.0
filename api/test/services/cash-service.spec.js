/* eslint no-magic-numbers: "off" */

'use strict';

import _ from 'lodash';
import { should, use, expect } from 'chai';
import 'regenerator-runtime/runtime.js';

import { ping } from 'config/mongodb-config';
import { accountModel, transactionModel } from 'models';
import { transferCash } from 'services/cash-service';

should();
use(require('chai-things'));

const loadInitialBalances = async (db, form) => {
  if (form.from.id) {
    const fromAc = await accountModel.findById(db, form.from.id);
    form.from.balance = fromAc.balance;
  }
  if (form.to.id) {
    const toAc = await accountModel.findById(db, form.to.id);
    form.to.balance = toAc.balance;
  }
};

const checkBalances = async (db, form, original) => {
  if (form.from.id) {
    const fromAc = await accountModel.findById(db, form.from.id);
    const fromBalance = original
      ? form.from.balance
      : form.from.cash
      ? form.from.balance - form.amount
      : form.from.balance + form.amount;
    expect(fromAc).to.have.property('cash', form.from.cash);
    expect(fromAc).to.have.property('balance', fromBalance);
  }

  if (form.to.id) {
    const toAc = await accountModel.findById(db, form.to.id);
    const toBalance = original
      ? form.to.balance
      : form.to.cash
      ? form.to.balance + form.amount
      : form.to.balance - form.amount;
    expect(toAc).to.have.property('cash', form.to.cash);
    expect(toAc).to.have.property('balance', toBalance);
  }
};

const reverseTransfer = async (db, form) => {
  form.amount = form.amount * -1;
  await transferCash(form);
  await checkBalances(db, form, true);
};

describe('services.cashService', () => {
  let db = null;

  before('get db connection', (done) => {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('transferCash', () => {
    // case #0
    describe('transfer cash - regular', () => {
      const form = {
        db: null,
        from: { id: 62, balance: 0, cash: true },
        to: { id: 60, balance: 0, cash: false },
        amount: 50.25,
        seq: 0,
      };

      before('fetch account balance', async () => {
        await loadInitialBalances(db, form);
      });
      it('should transfer cash', async () => {
        form.db = db;
        await transferCash(form);
        await checkBalances(db, form);
        await reverseTransfer(db, form);
      });
    });
    // case #1
    describe('transfer cash - from account null', () => {
      const form = {
        db: null,
        from: { id: 0, balance: 0 },
        to: { id: 60, balance: 0, cash: false },
        amount: 50.25,
        seq: 0,
      };

      before('fetch account balance', async () => {
        await loadInitialBalances(db, form);
      });
      it('should transfer cash', async () => {
        form.db = db;
        await transferCash(form);
        await checkBalances(db, form);
        await reverseTransfer(db, form);
      });
    });
    // case #2
    describe('transfer cash - to account null', () => {
      const form = {
        db: null,
        from: { id: 60, balance: 0, cash: false },
        to: { id: 0, balance: 0 },
        amount: 50.25,
        seq: 0,
      };

      before('fetch account balance', async () => {
        await loadInitialBalances(db, form);
      });
      it('should transfer cash', async () => {
        form.db = db;
        await transferCash(form);
        await checkBalances(db, form);
        await reverseTransfer(db, form);
      });
    });
    // case #3
    describe('transfer cash - cash account', () => {
      const form = {
        db: null,
        from: { id: 62, balance: 0, cash: true },
        to: { id: 80, balance: 0, cash: true },
        amount: 50.25,
        seq: 0,
      };

      before('fetch account balance', async () => {
        await loadInitialBalances(db, form);
      });
      it('should transfer cash', async () => {
        form.db = db;
        await transferCash(form);
        await checkBalances(db, form);
        await reverseTransfer(db, form);
      });
    });
    // case #5
    describe('transfer cash - credit card account', () => {
      const form = {
        db: null,
        from: { id: 60, balance: 0, cash: false },
        to: { id: 68, balance: 0, cash: false },
        amount: 50.25,
        seq: 0,
      };

      before('fetch account balance', async () => {
        await loadInitialBalances(db, form);
      });
      it('should transfer cash', async () => {
        form.db = db;
        await transferCash(form);
        await checkBalances(db, form);
        await reverseTransfer(db, form);
      });
    });
    // case #6
    describe('transfer cash - negative amount', () => {
      const form = {
        db: null,
        from: { id: 62, balance: 0, cash: true },
        to: { id: 80, balance: 0, cash: true },
        amount: -50.25,
        seq: 0,
      };

      before('fetch account balance', async () => {
        await loadInitialBalances(db, form);
      });
      it('should transfer cash', async () => {
        form.db = db;
        await transferCash(form);
        await checkBalances(db, form);
        await reverseTransfer(db, form);
      });
    });
    // case #7
    describe('transfer cash - seq not zero', () => {
      const form = {
        db: null,
        from: { id: 60, cityId: 20140301, balance: 0, cash: false },
        to: { id: 83, cityId: 20140301, balance: 0, cash: false },
        amount: 50.25,
        seq: 11000,
      };

      const balances = { from: [], to: [] };

      before('fetch account balances', async () => {
        await loadInitialBalances(db, form);
      });
      before('fetch transaction item balances', async () => {
        const fromTrans = await transactionModel.findForAcct(db, form.from.cityId, form.from.id);
        balances.from = fromTrans.map((tr) => {
          // build the expected balances for 'from' account.
          tr.accounts.from.balanceBfExp = tr.accounts.from.balanceBf;
          tr.accounts.from.balanceAfExp = tr.accounts.from.balanceAf;
          tr.accounts.to.balanceBfExp = tr.accounts.to.balanceBf;
          tr.accounts.to.balanceAfExp = tr.accounts.to.balanceAf;
          if (tr.seq >= form.seq) {
            if (tr.accounts.from.id === form.from.id) {
              tr.accounts.from.balanceBfExp += form.amount;
              tr.accounts.from.balanceAfExp += form.amount;
            }
            if (tr.accounts.to.id === form.from.id) {
              tr.accounts.to.balanceBfExp += form.amount;
              tr.accounts.to.balanceAfExp += form.amount;
            }
          }
          return { id: tr.id, seq: tr.seq, accounts: tr.accounts };
        });

        const toTrans = await transactionModel.findForAcct(db, form.to.cityId, form.to.id);
        balances.to = toTrans.map((tr) => {
          // build the expected balances for 'to' account.
          tr.accounts.from.balanceBfExp = tr.accounts.from.balanceBf;
          tr.accounts.from.balanceAfExp = tr.accounts.from.balanceAf;
          tr.accounts.to.balanceBfExp = tr.accounts.to.balanceBf;
          tr.accounts.to.balanceAfExp = tr.accounts.to.balanceAf;
          if (tr.seq >= form.seq) {
            if (tr.accounts.from.id === form.to.id) {
              tr.accounts.from.balanceBfExp -= form.amount;
              tr.accounts.from.balanceAfExp -= form.amount;
            }
            if (tr.accounts.to.id === form.to.id) {
              tr.accounts.to.balanceBfExp -= form.amount;
              tr.accounts.to.balanceAfExp -= form.amount;
            }
          }
          return { id: tr.id, seq: tr.seq, accounts: tr.accounts };
        });
      });
      it('should transfer cash', async () => {
        form.db = db;
        await transferCash(form);
        await checkBalances(db, form);

        // check from account - post checking.
        const fromTrans = await transactionModel.findForAcct(db, form.from.cityId, form.from.id);
        fromTrans.forEach((tr) => {
          const beforeTr = _.find(balances.from, ['id', tr.id]);
          expect(tr.accounts.from).to.have.property('balanceBf', beforeTr.accounts.from.balanceBfExp);
          expect(tr.accounts.from).to.have.property('balanceAf', beforeTr.accounts.from.balanceAfExp);
          expect(tr.accounts.to).to.have.property('balanceBf', beforeTr.accounts.to.balanceBfExp);
          expect(tr.accounts.to).to.have.property('balanceAf', beforeTr.accounts.to.balanceAfExp);
        });

        // check to account - post checking.
        const toTrans = await transactionModel.findForAcct(db, form.to.cityId, form.to.id);
        toTrans.forEach((tr) => {
          const beforeTr = _.find(balances.to, ['id', tr.id]);
          expect(tr.accounts.from).to.have.property('balanceBf', beforeTr.accounts.from.balanceBfExp);
          expect(tr.accounts.from).to.have.property('balanceAf', beforeTr.accounts.from.balanceAfExp);
          expect(tr.accounts.to).to.have.property('balanceBf', beforeTr.accounts.to.balanceBfExp);
          expect(tr.accounts.to).to.have.property('balanceAf', beforeTr.accounts.to.balanceAfExp);
        });

        await reverseTransfer(db, form);
      });
    });
  });
  after('close db connection', () => {
    // do nothing.
  });
});
