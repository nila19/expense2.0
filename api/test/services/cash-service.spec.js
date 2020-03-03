/* eslint no-magic-numbers: "off" */

'use strict';
import _ from 'lodash';
import { should, use, expect } from 'chai';

import Accounts from '../../models/Accounts';
import Transactions from '../../models/Transactions';
import { transferCash } from '../../services/cash-service';
import { ping } from '../../config/mongodb-config.js';

should();
use(require('chai-things'));

const accounts = Accounts();
const transactions = Transactions();

describe('services.cashService', function() {
  let db = null;

  before('get db connection', function(done) {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('transferCash', function() {
    // case #0
    describe('transfer cash - regular', function() {
      const form = {
        db: null,
        from: { id: 62, balance: 0 },
        to: { id: 60, balance: 0 },
        amount: 50.25,
        seq: 0
      };

      before('fetch account balance', function(done) {
        form.db = db;
        accounts.findById(db, form.from.id).then(ac => {
          form.from.balance = ac.balance;
          accounts.findById(db, form.to.id).then(ac => {
            form.to.balance = ac.balance;
            done();
          });
        });
      });
      it('should transfer cash', function(done) {
        form.db = db;
        transferCash(form).then(() => {
          accounts.findById(db, form.from.id).then(ac => {
            expect(ac).to.have.property('cash', true);
            expect(ac).to.have.property('balance', form.from.balance - form.amount);
            accounts.findById(db, form.to.id).then(ac => {
              expect(ac).to.have.property('cash', false);
              expect(ac).to.have.property('balance', form.to.balance - form.amount);
              done();
            });
          });
        });
      });
      after('negate the cash transfer', function(done) {
        // reverse the accounts
        form.amount = form.amount * -1;
        transferCash(form).then(() => {
          accounts.findById(db, form.from.id).then(ac => {
            expect(ac).to.have.property('balance', form.from.balance);
            accounts.findById(db, form.to.id).then(ac => {
              expect(ac).to.have.property('balance', form.to.balance);
              done();
            });
          });
        });
      });
    });
    // case #1
    describe('transfer cash - from account null', function() {
      const form = {
        db: null,
        from: { id: 0, balance: 0 },
        to: { id: 60, balance: 0 },
        amount: 50.25,
        seq: 0
      };

      before('fetch account balance', function(done) {
        form.db = db;
        accounts.findById(db, form.to.id).then(ac => {
          form.to.balance = ac.balance;
          done();
        });
      });
      it('should transfer cash', function(done) {
        form.db = db;
        transferCash(form).then(() => {
          accounts.findById(db, form.to.id).then(ac => {
            expect(ac).to.have.property('cash', false);
            expect(ac).to.have.property('balance', form.to.balance - form.amount);
            done();
          });
        });
      });
      after('negate the cash transfer', function(done) {
        // reverse the accounts
        form.amount = form.amount * -1;
        transferCash(form).then(() => {
          accounts.findById(db, form.to.id).then(ac => {
            expect(ac).to.have.property('balance', form.to.balance);
            done();
          });
        });
      });
    });
    // case #2
    describe('transfer cash - to account null', function() {
      const form = {
        db: null,
        from: { id: 60, balance: 0 },
        to: { id: 0, balance: 0 },
        amount: 50.25,
        seq: 0
      };

      before('fetch account balance', function(done) {
        form.db = db;
        accounts.findById(db, form.from.id).then(ac => {
          form.from.balance = ac.balance;
          done();
        });
      });
      it('should transfer cash', function(done) {
        form.db = db;
        transferCash(form).then(() => {
          accounts.findById(db, form.from.id).then(ac => {
            expect(ac).to.have.property('cash', false);
            expect(ac).to.have.property('balance', form.from.balance + form.amount);
            done();
          });
        });
      });
      after('negate the cash transfer', function(done) {
        // reverse the accounts
        form.amount = form.amount * -1;
        transferCash(form).then(() => {
          accounts.findById(db, form.from.id).then(ac => {
            expect(ac).to.have.property('balance', form.from.balance);
            done();
          });
        });
      });
    });
    // case #3
    describe('transfer cash - cash account', function() {
      const form = {
        db: null,
        from: { id: 62, balance: 0 },
        to: { id: 80, balance: 0 },
        amount: 50.25,
        seq: 0
      };

      before('fetch account balance', function(done) {
        form.db = db;
        accounts.findById(db, form.from.id).then(ac => {
          form.from.balance = ac.balance;
          accounts.findById(db, form.to.id).then(ac => {
            form.to.balance = ac.balance;
            done();
          });
        });
      });
      it('should transfer cash', function(done) {
        form.db = db;
        transferCash(form).then(() => {
          accounts.findById(db, form.from.id).then(ac => {
            expect(ac).to.have.property('cash', true);
            expect(ac).to.have.property('balance', form.from.balance - form.amount);
            accounts.findById(db, form.to.id).then(ac => {
              expect(ac).to.have.property('cash', true);
              expect(ac).to.have.property('balance', form.to.balance + form.amount);
              done();
            });
          });
        });
      });
      after('negate the cash transfer', function(done) {
        // reverse the accounts
        form.amount = form.amount * -1;
        transferCash(form).then(() => {
          accounts.findById(db, form.from.id).then(ac => {
            expect(ac).to.have.property('balance', form.from.balance);
            accounts.findById(db, form.to.id).then(ac => {
              expect(ac).to.have.property('balance', form.to.balance);
              done();
            });
          });
        });
      });
    });
    // case #5
    describe('transfer cash - credit card account', function() {
      const form = {
        db: null,
        from: { id: 60, balance: 0 },
        to: { id: 68, balance: 0 },
        amount: 50.25,
        seq: 0
      };

      before('fetch account balance', function(done) {
        form.db = db;
        accounts.findById(db, form.from.id).then(ac => {
          form.from.balance = ac.balance;
          accounts.findById(db, form.to.id).then(ac => {
            form.to.balance = ac.balance;
            done();
          });
        });
      });
      it('should transfer cash', function(done) {
        form.db = db;
        transferCash(form).then(() => {
          accounts.findById(db, form.from.id).then(ac => {
            expect(ac).to.have.property('cash', false);
            expect(ac).to.have.property('balance', form.from.balance + form.amount);
            accounts.findById(db, form.to.id).then(ac => {
              expect(ac).to.have.property('cash', false);
              expect(ac).to.have.property('balance', form.to.balance - form.amount);
              done();
            });
          });
        });
      });
      after('negate the cash transfer', function(done) {
        // reverse the accounts
        form.amount = form.amount * -1;
        transferCash(form).then(() => {
          accounts.findById(db, form.from.id).then(ac => {
            expect(ac).to.have.property('balance', form.from.balance);
            accounts.findById(db, form.to.id).then(ac => {
              expect(ac).to.have.property('balance', form.to.balance);
              done();
            });
          });
        });
      });
    });
    // case #6
    describe('transfer cash - negative amount', function() {
      const form = {
        db: null,
        from: { id: 62, balance: 0 },
        to: { id: 80, balance: 0 },
        amount: -50.25,
        seq: 0
      };

      before('fetch account balance', function(done) {
        form.db = db;
        accounts.findById(db, form.from.id).then(ac => {
          form.from.balance = ac.balance;
          accounts.findById(db, form.to.id).then(ac => {
            form.to.balance = ac.balance;
            done();
          });
        });
      });
      it('should transfer cash', function(done) {
        form.db = db;
        transferCash(form).then(() => {
          accounts.findById(db, form.from.id).then(ac => {
            expect(ac).to.have.property('cash', true);
            expect(ac).to.have.property('balance', form.from.balance - form.amount);
            accounts.findById(db, form.to.id).then(ac => {
              expect(ac).to.have.property('cash', true);
              expect(ac).to.have.property('balance', form.to.balance + form.amount);
              done();
            });
          });
        });
      });
      after('negate the cash transfer', function(done) {
        // reverse the accounts
        form.amount = form.amount * -1;
        transferCash(form).then(() => {
          accounts.findById(db, form.from.id).then(ac => {
            expect(ac).to.have.property('balance', form.from.balance);
            accounts.findById(db, form.to.id).then(ac => {
              expect(ac).to.have.property('balance', form.to.balance);
              done();
            });
          });
        });
      });
    });
    // case #7
    describe('transfer cash - seq not zero', function() {
      const form = {
        db: null,
        from: { id: 60, cityId: 20140301, balance: 0 },
        to: { id: 83, cityId: 20140301, balance: 0 },
        amount: 50.25,
        seq: 8500
      };

      const balances = { from: [], to: [] };

      before('fetch account balances', function(done) {
        form.db = db;
        accounts.findById(db, form.from.id).then(ac => {
          form.from.balance = ac.balance;
          accounts.findById(db, form.to.id).then(ac => {
            form.to.balance = ac.balance;
            done();
          });
        });
      });
      before('fetch transaction item balances', function(done) {
        form.db = db;
        transactions.findForAcct(db, form.from.cityId, form.from.id).then(trans => {
          balances.from = trans.map(tr => {
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
          transactions.findForAcct(db, form.to.cityId, form.to.id).then(trans => {
            balances.to = trans.map(tr => {
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
            done();
          });
        });
      });
      it('should transfer cash', function(done) {
        form.db = db;
        transferCash(form).then(() => {
          accounts.findById(db, form.from.id).then(ac => {
            expect(ac).to.have.property('cash', false);
            expect(ac).to.have.property('balance', form.from.balance + form.amount);
            accounts.findById(db, form.to.id).then(ac => {
              expect(ac).to.have.property('cash', false);
              expect(ac).to.have.property('balance', form.to.balance - form.amount);
              done();
            });
          });
        });
      });
      after('fetch transaction item balances - after from', function(done) {
        transactions.findForAcct(db, form.from.cityId, form.from.id).then(trans => {
          trans.forEach(tr => {
            const beforeTr = _.find(balances.from, ['id', tr.id]);

            expect(tr.accounts.from).to.have.property('balanceBf', beforeTr.accounts.from.balanceBfExp);
            expect(tr.accounts.from).to.have.property('balanceAf', beforeTr.accounts.from.balanceAfExp);
            expect(tr.accounts.to).to.have.property('balanceBf', beforeTr.accounts.to.balanceBfExp);
            expect(tr.accounts.to).to.have.property('balanceAf', beforeTr.accounts.to.balanceAfExp);
          });
          done();
        });
      });
      after('fetch transaction item balances - after to', function(done) {
        transactions.findForAcct(db, form.to.cityId, form.to.id).then(trans => {
          trans.forEach(tr => {
            const beforeTr = _.find(balances.to, ['id', tr.id]);

            expect(tr.accounts.from).to.have.property('balanceBf', beforeTr.accounts.from.balanceBfExp);
            expect(tr.accounts.from).to.have.property('balanceAf', beforeTr.accounts.from.balanceAfExp);
            expect(tr.accounts.to).to.have.property('balanceBf', beforeTr.accounts.to.balanceBfExp);
            expect(tr.accounts.to).to.have.property('balanceAf', beforeTr.accounts.to.balanceAfExp);
          });
          done();
        });
      });
      after('negate the cash transfer', function(done) {
        // reverse the accounts
        form.amount = form.amount * -1;
        transferCash(form).then(() => {
          accounts.findById(db, form.from.id).then(ac => {
            expect(ac).to.have.property('balance', form.from.balance);
            accounts.findById(db, form.to.id).then(ac => {
              expect(ac).to.have.property('balance', form.to.balance);
              done();
            });
          });
        });
      });
    });
  });
  after('close db connection', function() {
    // do nothing.
  });
});
