/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';
import { should, use, expect } from 'chai';

import Bills from '../../models/Bills';
import { ping } from '../../config/mongodb-config.js';

should();
use(require('chai-things'));

const bills = Bills();

describe('models.bills', function() {
  const cityId = 20140301;
  const acctId = 83;
  const billId = 95;
  let db = null;

  before('get db connection', function(done) {
    ping(null, function(err, db1) {
      db = db1;
      done();
    });
  });
  describe('findForCity', function() {
    it('should fetch all bills', function(done) {
      bills.findForCity(db, cityId, null).then(bills => {
        bills.should.all.have.property('closed', true);
        done();
      });
    });
    it('should fetch all paid bills', function(done) {
      bills.findForCity(db, cityId, 'Y').then(bills => {
        bills.should.all.have.property('closed', true);
        bills.should.all.have.property('balance', 0);
        done();
      });
    });
    it('should fetch all unpaid bills', function(done) {
      bills.findForCity(db, cityId, 'N').then(bills => {
        bills.should.all.have.property('closed', true);
        bills.map(b => b.balance).should.all.be.above(0);
        done();
      });
    });
  });
  describe('findForAcct', function() {
    it('should fetch all bills including open', function(done) {
      bills.findForAcct(db, acctId, null).then(bills => {
        bills.should.contain.some.with.property('closed', true);
        bills.should.contain.some.with.property('closed', false);
        done();
      });
    });
    it('should fetch all paid bills', function(done) {
      bills.findForAcct(db, acctId, 'Y').then(bills => {
        bills.should.all.have.property('closed', true);
        bills.should.all.have.property('balance', 0);
        done();
      });
    });
    it('should fetch all unpaid bills', function(done) {
      bills.findForAcct(db, acctId, 'N').then(bills => {
        bills.should.all.have.property('closed', true);
        bills.map(b => b.balance).should.all.be.above(0);
        done();
      });
    });
  });
  describe('findForCityOpen', function() {
    it('should fetch all open bills for city', function(done) {
      bills.findForCityOpen(db, cityId).then(bills => {
        bills.should.all.have.property('closed', false);
        done();
      });
    });
  });
  describe('findOneAndUpdate', function() {
    const newBal = 10;
    let balance = 0;

    before('backup db values', function(done) {
      bills.findById(db, billId).then(bill => {
        balance = bill.balance;
        done();
      });
    });
    it('should update bill', function(done) {
      bills.findOneAndUpdate(db, { id: billId }, { $set: { balance: newBal } }).then(() => {
        bills.findById(db, billId).then(bill => {
          expect(bill).to.have.property('balance', newBal);
          done();
        });
      });
    });
    after('restore db values', function(done) {
      bills.update(db, { id: billId }, { $set: { balance: balance } }).then(() => {
        done();
      });
    });
  });
  describe('update', function() {
    const newBal = 10;
    let balance = 0;

    before('backup db values', function(done) {
      bills.findById(db, billId).then(bill => {
        balance = bill.balance;
        done();
      });
    });
    it('should update bill', function(done) {
      bills.update(db, { id: billId }, { $set: { balance: newBal } }).then(() => {
        bills.findById(db, billId).then(bill => {
          expect(bill).to.have.property('balance', newBal);
          done();
        });
      });
    });
    after('restore db values', function(done) {
      bills.update(db, { id: billId }, { $set: { balance: balance } }).then(() => {
        done();
      });
    });
  });

  after('close db connection', function() {
    // do nothing.
  });
});
