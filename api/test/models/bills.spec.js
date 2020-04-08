/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';
import { should, use, expect } from 'chai';

import { bills } from '../../models/index';
import { ping } from '../../config/mongodb-config.js';

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
      const _bills = await bills.findForCity(db, cityId, null);
      _bills.should.all.have.property('closed', true);
    });
    it('should fetch all paid bills', async () => {
      const _bills = await bills.findForCity(db, cityId, 'Y');
      _bills.should.all.have.property('closed', true);
      _bills.should.all.have.property('balance', 0);
    });
    it('should fetch all unpaid bills', async () => {
      const _bills = await bills.findForCity(db, cityId, 'N');
      _bills.should.all.have.property('closed', true);
      _bills.map((b) => b.balance).should.all.be.above(0);
    });
  });
  describe('findForAcct', () => {
    it('should fetch all bills including open', async () => {
      const _bills = await bills.findForAcct(db, acctId, null);
      _bills.should.contain.some.with.property('closed', true);
      _bills.should.contain.some.with.property('closed', false);
    });
    it('should fetch all paid bills', async () => {
      const _bills = await bills.findForAcct(db, acctId, 'Y');
      _bills.should.all.have.property('closed', true);
      _bills.should.all.have.property('balance', 0);
    });
    it('should fetch all unpaid bills', async () => {
      const _bills = await bills.findForAcct(db, acctId, 'N');
      _bills.should.all.have.property('closed', true);
      _bills.map((b) => b.balance).should.all.be.above(0);
    });
  });
  describe('findForCityOpen', () => {
    it('should fetch all open bills for city', async () => {
      const _bills = await bills.findForCityOpen(db, cityId);
      _bills.should.all.have.property('closed', false);
    });
  });
  describe('findOneAndUpdate', () => {
    const newBal = 10;
    let balance = 0;

    before('backup db values', async () => {
      const bill = await bills.findById(db, billId);
      balance = bill.balance;
    });
    it('should update bill', async () => {
      await bills.findOneAndUpdate(db, { id: billId }, { $set: { balance: newBal } });
      const bill = await bills.findById(db, billId);
      expect(bill).to.have.property('balance', newBal);
    });
    after('restore db values', async () => {
      await bills.updateOne(db, { id: billId }, { $set: { balance: balance } });
    });
  });
  describe('update', () => {
    const newBal = 10;
    let balance = 0;

    before('backup db values', async () => {
      const bill = await bills.findById(db, billId);
      balance = bill.balance;
    });
    it('should update bill', async () => {
      await bills.updateOne(db, { id: billId }, { $set: { balance: newBal } });
      const bill = await bills.findById(db, billId);
      expect(bill).to.have.property('balance', newBal);
    });
    after('restore db values', async () => {
      await bills.updateOne(db, { id: billId }, { $set: { balance: balance } });
    });
  });

  after('close db connection', () => {
    // do nothing.
  });
});
