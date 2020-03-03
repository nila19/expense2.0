/* eslint no-magic-numbers: "off" */

'use strict';
import moment from 'moment';
import { should, use, expect } from 'chai';

import Accounts from '../../models/Accounts';
import Transactions from '../../models/Transactions';
import { addExpensePromise } from '../../services/add-service';
import { deleteExpense } from '../../services/delete-service';
import { ping } from '../../config/mongodb-config.js';

should();
use(require('chai-things'));

const accounts = Accounts();
const transactions = Transactions();

describe('services.addService', function() {
  let db = null;

  before('get db connection', function(done) {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('addExpensePromise', function() {
    // case #0
    describe('add expense with an inactive city', function() {
      const acctId = 68;
      const amt = 100.25;
      const formData = {
        city: { id: 20090201 },
        adjust: false,
        adhoc: false,
        category: { id: 188 },
        description: { name: 'Mocha testing' },
        amount: amt,
        transDt: '15-May-2017',
        accounts: { from: { id: acctId }, to: null }
      };
      let transId = 0;
      let acBalance = 0;

      before('fetch account balance', function(done) {
        accounts.findById(db, acctId).then(ac => {
          acBalance = ac.balance;
          done();
        });
      });
      it('should throw an error', function(done) {
        addExpensePromise({ db: db, log: { error: () => {} } }, formData)
          .then(t => {
            transId = t.id;
            expect().fail('Exception not thrown in the add expense with inactive city');
            done();
          })
          .catch(e => {
            expect(e.message).to.equal('City is not active.');
            done();
          });
      });
      after('delete the added expense', function(done) {
        if (!transId) {
          done();
        } else {
          deleteExpense({ db: db, log: console, transId: transId }, () => {
            accounts.findById(db, acctId).then(ac => {
              expect(ac).to.have.property('balance', acBalance);
              done();
            });
          });
        }
      });
    });
    // case #1
    describe('add a regular expense', function() {
      const acctId = 68;
      const amt = 100.25;
      const formData = {
        city: { id: 20140301 },
        adjust: false,
        adhoc: false,
        category: { id: 188 },
        description: { name: 'Mocha testing' },
        amount: amt,
        transDt: '15-May-2017',
        accounts: { from: { id: acctId }, to: null }
      };
      let transId = 0;
      let acBalance = 0;
      const entryMth = moment()
        .startOf('month')
        .format('YYYY-MM-DD');

      before('fetch account balance', function(done) {
        accounts.findById(db, acctId).then(ac => {
          acBalance = ac.balance;
          done();
        });
      });
      it('should add a regular expense', function(done) {
        addExpensePromise({ db: db, log: console }, formData).then(t => {
          transId = t.id;
          transactions.findById(db, transId).then(tr => {
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
            accounts.findById(db, acctId).then(ac => {
              expect(ac).to.have.property('balance', acBalance + amt);
              done();
            });
          });
        });
      });
      after('delete the added expense', function(done) {
        deleteExpense({ db: db, log: console, transId: transId }, () => {
          accounts.findById(db, acctId).then(ac => {
            expect(ac).to.have.property('balance', acBalance);
            done();
          });
        });
      });
    });
    // case #2
    describe('add a regular expense - negative amount', function() {
      const acctId = 68;
      const amt = -100.25;
      const formData = {
        city: { id: 20140301 },
        adjust: false,
        adhoc: false,
        category: { id: 188 },
        description: { name: 'Mocha testing' },
        amount: amt,
        transDt: '15-May-2017',
        accounts: { from: { id: acctId }, to: null }
      };
      let transId = 0;
      let acBalance = 0;
      const entryMth = moment()
        .startOf('month')
        .format('YYYY-MM-DD');

      before('fetch account balance', function(done) {
        accounts.findById(db, acctId).then(ac => {
          acBalance = ac.balance;
          done();
        });
      });
      it('should add a regular expense - negative amount', function(done) {
        addExpensePromise({ db: db, log: console }, formData).then(t => {
          transId = t.id;
          transactions.findById(db, transId).then(tr => {
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
            accounts.findById(db, acctId).then(ac => {
              expect(ac).to.have.property('balance', acBalance + amt);
              done();
            });
          });
        });
      });
      after('delete the added expense', function(done) {
        deleteExpense({ db: db, log: console, transId: transId }, () => {
          accounts.findById(db, acctId).then(ac => {
            expect(ac).to.have.property('balance', acBalance);
            done();
          });
        });
      });
    });
    // case #3
    describe('add an adjustment', function() {
      const fromAcctId = 62;
      const toAcctId = 68;
      const amt = 100.25;
      const formData = {
        city: { id: 20140301 },
        adjust: true,
        adhoc: false,
        category: null,
        description: 'Mocha testing #3',
        amount: amt,
        transDt: '20-May-2017',
        accounts: { from: { id: fromAcctId }, to: { id: toAcctId } }
      };
      let transId = 0;
      let frAcBalance = 0;
      let toAcBalance = 0;
      const entryMth = moment()
        .startOf('month')
        .format('YYYY-MM-DD');

      before('fetch account balance', function(done) {
        accounts.findById(db, fromAcctId).then(ac => {
          frAcBalance = ac.balance;
          accounts.findById(db, toAcctId).then(ac => {
            toAcBalance = ac.balance;
            done();
          });
        });
      });
      it('should add an adjustment', function(done) {
        addExpensePromise({ db: db, log: console }, formData).then(t => {
          transId = t.id;
          transactions.findById(db, transId).then(tr => {
            expect(tr).to.have.property('id', transId);
            expect(tr).to.have.property('cityId', 20140301);
            expect(tr).to.have.property('entryMonth', entryMth);
            expect(tr.category).to.have.property('id', 0);
            expect(tr).to.have.property('description', 'Mocha Testing #3');
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
            accounts.findById(db, fromAcctId).then(ac => {
              expect(ac).to.have.property('balance', frAcBalance - amt);
              accounts.findById(db, toAcctId).then(ac => {
                expect(ac).to.have.property('balance', toAcBalance - amt);
                done();
              });
            });
          });
        });
      });
      after('delete the added expense', function(done) {
        deleteExpense({ db: db, log: console, transId: transId }, () => {
          accounts.findById(db, fromAcctId).then(ac => {
            expect(ac).to.have.property('balance', frAcBalance);
            accounts.findById(db, toAcctId).then(ac => {
              expect(ac).to.have.property('balance', toAcBalance);
              done();
            });
          });
        });
      });
    });
    // case #4
    describe('add an adjustment - negative amount', function() {
      const fromAcctId = 62;
      const toAcctId = 68;
      const amt = -100.25;
      const formData = {
        city: { id: 20140301 },
        adjust: true,
        adhoc: false,
        category: null,
        description: 'Mocha testing #3',
        amount: amt,
        transDt: '20-May-2017',
        accounts: { from: { id: fromAcctId }, to: { id: toAcctId } }
      };
      let transId = 0;
      let frAcBalance = 0;
      let toAcBalance = 0;
      const entryMth = moment()
        .startOf('month')
        .format('YYYY-MM-DD');

      before('fetch account balance', function(done) {
        accounts.findById(db, fromAcctId).then(ac => {
          frAcBalance = ac.balance;
          accounts.findById(db, toAcctId).then(ac => {
            toAcBalance = ac.balance;
            done();
          });
        });
      });
      it('should add an adjustment - negative amount', function(done) {
        addExpensePromise({ db: db, log: console }, formData).then(t => {
          transId = t.id;
          transactions.findById(db, transId).then(tr => {
            expect(tr).to.have.property('id', transId);
            expect(tr).to.have.property('cityId', 20140301);
            expect(tr).to.have.property('entryMonth', entryMth);
            expect(tr.category).to.have.property('id', 0);
            expect(tr).to.have.property('description', 'Mocha Testing #3');
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
            accounts.findById(db, fromAcctId).then(ac => {
              expect(ac).to.have.property('balance', frAcBalance - amt);
              accounts.findById(db, toAcctId).then(ac => {
                expect(ac).to.have.property('balance', toAcBalance - amt);
                done();
              });
            });
          });
        });
      });
      after('delete the added expense', function(done) {
        deleteExpense({ db: db, log: console, transId: transId }, () => {
          accounts.findById(db, fromAcctId).then(ac => {
            expect(ac).to.have.property('balance', frAcBalance);
            accounts.findById(db, toAcctId).then(ac => {
              expect(ac).to.have.property('balance', toAcBalance);
              done();
            });
          });
        });
      });
    });
    // case #5
    describe('add an adjustment - fromAccount blank', function() {
      const toAcctId = 68;
      const amt = 100.25;
      const formData = {
        city: { id: 20140301 },
        adjust: true,
        adhoc: false,
        category: null,
        description: 'Mocha testing #3',
        amount: amt,
        transDt: '20-May-2017',
        accounts: { from: null, to: { id: toAcctId } }
      };
      let transId = 0;
      let toAcBalance = 0;
      const entryMth = moment()
        .startOf('month')
        .format('YYYY-MM-DD');

      before('fetch account balance', function(done) {
        accounts.findById(db, toAcctId).then(ac => {
          toAcBalance = ac.balance;
          done();
        });
      });
      it('should add an adjustment - fromAccount blank', function(done) {
        addExpensePromise({ db: db, log: console }, formData).then(t => {
          transId = t.id;
          transactions.findById(db, transId).then(tr => {
            expect(tr).to.have.property('id', transId);
            expect(tr).to.have.property('cityId', 20140301);
            expect(tr).to.have.property('entryMonth', entryMth);
            expect(tr.category).to.have.property('id', 0);
            expect(tr).to.have.property('description', 'Mocha Testing #3');
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
            accounts.findById(db, toAcctId).then(ac => {
              expect(ac).to.have.property('balance', toAcBalance - amt);
              done();
            });
          });
        });
      });
      after('delete the added expense', function(done) {
        deleteExpense({ db: db, log: console, transId: transId }, () => {
          accounts.findById(db, toAcctId).then(ac => {
            expect(ac).to.have.property('balance', toAcBalance);
            done();
          });
        });
      });
    });
    // case #6
    describe('add an adjustment - toAccount blank', function() {
      const fromAcctId = 62;
      const amt = 100.25;
      const formData = {
        city: { id: 20140301 },
        adjust: true,
        adhoc: false,
        category: null,
        description: 'Mocha testing #3',
        amount: amt,
        transDt: '20-May-2017',
        accounts: { from: { id: fromAcctId }, to: null }
      };
      let transId = 0;
      let frAcBalance = 0;
      const entryMth = moment()
        .startOf('month')
        .format('YYYY-MM-DD');

      before('fetch account balance', function(done) {
        accounts.findById(db, fromAcctId).then(ac => {
          frAcBalance = ac.balance;
          done();
        });
      });
      it('should add an adjustment - toAccount blank', function(done) {
        addExpensePromise({ db: db, log: console }, formData).then(t => {
          transId = t.id;
          transactions.findById(db, transId).then(tr => {
            expect(tr).to.have.property('id', transId);
            expect(tr).to.have.property('cityId', 20140301);
            expect(tr).to.have.property('entryMonth', entryMth);
            expect(tr.category).to.have.property('id', 0);
            expect(tr).to.have.property('description', 'Mocha Testing #3');
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
            accounts.findById(db, fromAcctId).then(ac => {
              expect(ac).to.have.property('balance', frAcBalance - amt);
              done();
            });
          });
        });
      });
      after('delete the added expense', function(done) {
        deleteExpense({ db: db, log: console, transId: transId }, () => {
          accounts.findById(db, fromAcctId).then(ac => {
            expect(ac).to.have.property('balance', frAcBalance);
            done();
          });
        });
      });
    });
  });
  after('close db connection', function() {
    // do nothing.
  });
});
