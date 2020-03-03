/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';
import moment from 'moment';
import { should, use, expect } from 'chai';

import Accounts from '../../models/Accounts';
import Bills from '../../models/Bills';
import Transactions from '../../models/Transactions';
import { addExpensePromise } from '../../services/add-service';
import { deleteExpense } from '../../services/delete-service';
import { ping } from '../../config/mongodb-config.js';
import format from '../../config/formats';

should();
use(require('chai-things'));

const accounts = Accounts();
const transactions = Transactions();
const bills = Bills();

// ====================== Reusable Functions ======================//
const fetchData = (db, transId, data, done) => {
  transactions.findById(db, transId).then(tr => {
    data.trans = tr;
    accounts.findById(db, tr.accounts.from.id).then(ac => {
      data.accounts.from = ac;
      accounts.findById(db, tr.accounts.to.id).then(ac => {
        data.accounts.to = ac;
        if (tr.adjust || !tr.bill) {
          done();
        } else {
          bills.findById(db, tr.bill.id).then(bill => {
            data.bill = bill;
            done();
          });
        }
      });
    });
  });
};

const reInsertTrans = (db, data, done) => {
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

  addExpensePromise({ db: db, log: { error: () => {} } }, form).then(tr => {
    const mod = {
      id: data.trans.id,
      seq: data.trans.seq,
      'accounts.from.balanceBf': data.trans.accounts.from.balanceBf,
      'accounts.from.balanceAf': data.trans.accounts.from.balanceAf,
      'accounts.to.balanceBf': data.trans.accounts.to.balanceBf,
      'accounts.to.balanceAf': data.trans.accounts.to.balanceAf,
      tallied: data.trans.tallied,
      tallyDt: data.trans.tallyDt
    };

    transactions.findOneAndUpdate(db, { id: tr.id }, { $set: mod }).then(() => {
      accounts.findById(db, data.accounts.from.id).then(ac => {
        expect(ac).to.have.property('balance', data.accounts.from.balance);
        accounts.findById(db, data.accounts.to.id).then(ac => {
          if (data.accounts.to.id) {
            expect(ac).to.have.property('balance', data.accounts.to.balance);
          }
          if (!data.bill) {
            done();
          } else {
            const mod = { 'bill.id': data.bill.id, 'bill.billDt': data.bill.billDt, 'bill.name': data.bill.name };

            transactions.findOneAndUpdate(db, { id: data.trans.id }, { $set: mod }).then(() => {
              const mod = { amount: data.trans.amount, balance: data.trans.amount };

              bills.findOneAndUpdate(db, { id: data.bill.id }, { $inc: mod }).then(() => {
                bills.findById(db, data.bill.id).then(bill => {
                  expect(bill).to.have.property('amount', data.bill.amount);
                  expect(bill).to.have.property('balance', data.bill.balance);
                  done();
                });
              });
            });
          }
        });
      });
    });
  });
};

// ====================== Test Cases ======================//
describe('services.deleteService', function() {
  let db = null;

  before('get db connection', function(done) {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('deleteExpense', function() {
    // case #0
    describe('delete expense for an inactive city', function() {
      const transId = 3169;
      let deleted = false;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null
      };

      before('fetch trans details', function(done) {
        fetchData(db, transId, data, done);
      });
      it('should throw an error for delete transaction with inactive city', function(done) {
        deleteExpense({ db: db, transId: transId, log: { error: () => {} } }, err => {
          if (err) {
            expect(err.message).to.equal('City is not active.');
          } else {
            deleted = true;
            expect.fail('ok', 'error', 'Exception not thrown in the delete expense with inactive city');
          }
          done();
        });
      });
      after('add the deleted expense', function(done) {
        if (!deleted) {
          done();
        } else {
          reInsertTrans(db, data, done);
        }
      });
    });
    // case #1
    describe('delete expense - inactive account', function() {
      const transId = 7931;
      let deleted = false;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null
      };

      before('fetch trans details', function(done) {
        fetchData(db, transId, data, done);
      });
      it('should throw an error for delete transaction with inactive account', function(done) {
        deleteExpense({ db: db, transId: transId, log: { error: () => {} } }, err => {
          if (err) {
            expect(err.message).to.equal('Change invalid. Account(s) involved are not active...');
          } else {
            deleted = true;
            expect.fail('ok', 'error', 'Exception not thrown in the delete expense with inactive acccount.');
          }
          done();
        });
      });
      after('add the deleted expense', function(done) {
        if (!deleted) {
          done();
        } else {
          reInsertTrans(db, data, done);
        }
      });
    });
    // case #2
    describe('delete expense - one account inactive', function() {
      const transId = 7838;
      let deleted = false;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null
      };

      before('fetch trans details', function(done) {
        fetchData(db, transId, data, done);
      });
      it('should throw an error for delete transaction with one inactive account', function(done) {
        deleteExpense({ db: db, transId: transId, log: { error: () => {} } }, err => {
          if (err) {
            expect(err.message).to.equal('Change invalid. Account(s) involved are not active...');
          } else {
            deleted = true;
            expect.fail('ok', 'error', 'Exception not thrown in the delete expense with one inactive acccount.');
          }
          done();
        });
      });
      after('add the deleted expense', function(done) {
        if (!deleted) {
          done();
        } else {
          reInsertTrans(db, data, done);
        }
      });
    });
    // case #3
    describe('delete expense - positive amount', function() {
      const transId = 8443;
      let deleted = false;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null
      };

      before('fetch trans details', function(done) {
        fetchData(db, transId, data, done);
      });
      it('should delete expense with positive amount', function(done) {
        deleteExpense({ db: db, transId: transId, log: { error: () => {} } }, err => {
          expect(err).to.be.undefined;
          if (err) {
            done();
          } else {
            deleted = true;
            transactions.findById(db, transId).then(tr => {
              expect(tr).to.be.null;
              accounts.findById(db, data.accounts.from.id).then(ac => {
                expect(ac).to.have.property('balance', data.accounts.from.balance - data.trans.amount);
                if (data.trans.adjust || !data.trans.bill) {
                  done();
                } else {
                  bills.findById(db, data.bill.id).then(bill => {
                    expect(bill).to.have.property('amount', data.bill.amount - data.trans.amount);
                    expect(bill).to.have.property('balance', data.bill.balance - data.trans.amount);
                    done();
                  });
                }
              });
            });
          }
        });
      });
      after('add the deleted expense', function(done) {
        if (!deleted) {
          done();
        } else {
          reInsertTrans(db, data, done);
        }
      });
    });
    // case #4
    describe('delete expense - negative amount', function() {
      const transId = 8493;
      let deleted = false;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null
      };

      before('fetch trans details', function(done) {
        fetchData(db, transId, data, done);
      });
      it('should delete expense with negative amount', function(done) {
        deleteExpense({ db: db, transId: transId, log: { error: () => {} } }, err => {
          expect(err).to.be.undefined;
          if (err) {
            done();
          } else {
            deleted = true;
            transactions.findById(db, transId).then(tr => {
              expect(tr).to.be.null;
              accounts.findById(db, data.accounts.from.id).then(ac => {
                expect(ac).to.have.property('balance', data.accounts.from.balance - data.trans.amount);
                if (data.trans.adjust || !data.trans.bill) {
                  done();
                } else {
                  bills.findById(db, data.bill.id).then(bill => {
                    expect(bill).to.have.property('amount', data.bill.amount - data.trans.amount);
                    expect(bill).to.have.property('balance', data.bill.balance - data.trans.amount);
                    done();
                  });
                }
              });
            });
          }
        });
      });
      after('add the deleted expense', function(done) {
        if (!deleted) {
          done();
        } else {
          reInsertTrans(db, data, done);
        }
      });
    });
    // case #6
    describe('delete expense - open bill', function() {
      const transId = 8552;
      let deleted = false;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null
      };

      before('fetch trans details', function(done) {
        fetchData(db, transId, data, done);
      });
      it('should delete expense with negative amount', function(done) {
        deleteExpense({ db: db, transId: transId, log: { error: () => {} } }, err => {
          expect(err).to.be.undefined;
          if (err) {
            done();
          } else {
            deleted = true;
            transactions.findById(db, transId).then(tr => {
              expect(tr).to.be.null;
              accounts.findById(db, data.accounts.from.id).then(ac => {
                expect(ac).to.have.property('balance', data.accounts.from.balance - data.trans.amount);
                if (data.trans.adjust || !data.trans.bill) {
                  done();
                } else {
                  bills.findById(db, data.bill.id).then(bill => {
                    expect(bill).to.have.property('amount', data.bill.amount - data.trans.amount);
                    expect(bill).to.have.property('balance', data.bill.balance - data.trans.amount);
                    done();
                  });
                }
              });
            });
          }
        });
      });
      after('add the deleted expense', function(done) {
        if (!deleted) {
          done();
        } else {
          reInsertTrans(db, data, done);
        }
      });
    });
    // case #7
    describe('delete expense - adjustment', function() {
      const transId = 8535;
      let deleted = false;
      const data = {
        trans: null,
        accounts: { from: null, to: null },
        bill: null
      };

      before('fetch trans details', function(done) {
        fetchData(db, transId, data, done);
      });
      it('should delete adjustment expense', function(done) {
        deleteExpense({ db: db, transId: transId, log: { error: () => {} } }, err => {
          expect(err).to.be.undefined;
          if (err) {
            done();
          } else {
            deleted = true;
            transactions.findById(db, transId).then(tr => {
              expect(tr).to.be.null;
              accounts.findById(db, data.accounts.from.id).then(ac => {
                expect(ac).to.have.property('balance', data.accounts.from.balance + data.trans.amount);
                accounts.findById(db, data.accounts.to.id).then(ac => {
                  expect(ac).to.have.property('balance', data.accounts.to.balance + data.trans.amount);
                  if (data.trans.adjust || !data.trans.bill) {
                    done();
                  } else {
                    bills.findById(db, data.bill.id).then(bill => {
                      expect(bill).to.have.property('amount', data.bill.amount - data.trans.amount);
                      expect(bill).to.have.property('balance', data.bill.balance - data.trans.amount);
                      done();
                    });
                  }
                });
              });
            });
          }
        });
      });
      after('add the deleted expense', function(done) {
        if (!deleted) {
          done();
        } else {
          reInsertTrans(db, data, done);
        }
      });
    });
  });
  after('close db connection', function() {
    // do nothing.
  });
});
