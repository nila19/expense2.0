/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';
import { should, use, expect } from 'chai';

import Accounts from '../../models/Accounts';
import { ping } from '../../config/mongodb-config.js';

should();
use(require('chai-things'));

const accounts = Accounts();

describe('models.accounts', function() {
  const cityId = 20140301;
  const acctId = 81;
  let db = null;

  before('get db connection', function(done) {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('findForCity', function() {
    it('should fetch all active accounts = 9', function(done) {
      accounts.findForCity(db, cityId).then(accts => {
        accts.should.all.have.property('active', true);
        done();
      });
    });
  });
  describe('findBillable', function() {
    it('should fetch all active, billable accounts = 4', function(done) {
      accounts.findBillable(db, cityId).then(accts => {
        accts.should.all.have.property('active', true);
        accts.should.all.have.property('billed', true);
        done();
      });
    });
  });
  describe('update', function() {
    const newBal = 10;
    let balance = 0;

    before('backup db values', function(done) {
      accounts.findById(db, acctId).then(acct => {
        balance = acct.balance;
        done();
      });
    });
    it('should update account', function(done) {
      accounts.update(db, { id: acctId }, { $set: { balance: newBal } }).then(() => {
        accounts.findById(db, acctId).then(acct => {
          expect(acct).to.have.property('balance', newBal);
          done();
        });
      });
    });
    after('restore db values', function(done) {
      accounts.update(db, { id: acctId }, { $set: { balance: balance } }).then(() => {
        done();
      });
    });
  });

  after('close db connection', function() {
    // do nothing.
  });
});
