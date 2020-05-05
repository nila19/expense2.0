/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';

import { should, use, expect } from 'chai';
import 'regenerator-runtime/runtime.js';

import { ping } from 'config/mongodb-config';
import { billModel } from 'models';

should();
use(require('chai-things'));

describe('models.bills', () => {
  const cityId = 20140301;
  const acctId = 83;
  const billId = 95;
  let db = null;

  before('get db connection', (done) => {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('findForCity', () => {
    it('should fetch all bills', async () => {
      const _bills = await billModel.findForCity(db, cityId, null);
      _bills.should.all.have.property('cityId', cityId);
      _bills.should.contain.some.with.property('closed', true);
      _bills.should.contain.some.with.property('closed', false);
    });
    it('should fetch all paid bills', async () => {
      const _bills = await billModel.findForCity(db, cityId, 'Y');
      _bills.should.all.have.property('cityId', cityId);
      _bills.should.all.have.property('balance', 0);
    });
    it('should fetch all unpaid bills', async () => {
      const _bills = await billModel.findForCity(db, cityId, 'N');
      _bills.should.all.have.property('cityId', cityId);
      _bills.map((b) => b.balance).should.all.be.above(0);
    });
  });
  describe('findForAcct', () => {
    it('should fetch all bills including open', async () => {
      const _bills = await billModel.findForAcct(db, acctId, null);
      _bills.map((b) => b.account).should.all.have.property('id', acctId);
    });
    it('should fetch all paid bills', async () => {
      const _bills = await billModel.findForAcct(db, acctId, 'Y');
      _bills.map((b) => b.account).should.all.have.property('id', acctId);
      _bills.should.all.have.property('balance', 0);
    });
    it('should fetch all unpaid bills', async () => {
      const _bills = await billModel.findForAcct(db, acctId, 'N');
      _bills.map((b) => b.account).should.all.have.property('id', acctId);
      _bills.map((b) => b.balance).should.all.be.above(0);
    });
  });
  describe('findForCityOpen', () => {
    it('should fetch all open bills for city', async () => {
      const _bills = await billModel.findForCityOpen(db, cityId);
      _bills.should.all.have.property('closed', false);
    });
  });
  describe('findOneAndUpdate', () => {
    const newBal = 10;
    let balance = 0;

    before('backup db values', async () => {
      const bill = await billModel.findById(db, billId);
      balance = bill.balance;
    });
    it('should update bill', async () => {
      await billModel.findOneAndUpdate(db, { id: billId }, { $set: { balance: newBal } });
      const bill = await billModel.findById(db, billId);
      expect(bill).to.have.property('balance', newBal);
    });
    after('restore db values', async () => {
      await billModel.updateOne(db, { id: billId }, { $set: { balance: balance } });
    });
  });
  describe('update', () => {
    const newBal = 10;
    let balance = 0;

    before('backup db values', async () => {
      const bill = await billModel.findById(db, billId);
      balance = bill.balance;
    });
    it('should update bill', async () => {
      await billModel.updateOne(db, { id: billId }, { $set: { balance: newBal } });
      const bill = await billModel.findById(db, billId);
      expect(bill).to.have.property('balance', newBal);
    });
    after('restore db values', async () => {
      await billModel.updateOne(db, { id: billId }, { $set: { balance: balance } });
    });
  });

  after('close db connection', () => {
    // do nothing.
  });
});
