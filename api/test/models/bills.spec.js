/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';

import { should, use, expect } from 'chai';
import 'regenerator-runtime/runtime.js';

import { ping } from 'config/mongodb-config';

import { billModel } from 'data/models';

should();
use(require('chai-things'));

describe('models.bills', () => {
  const cityId = 20140301;
  const billId = 95;
  let db = null;

  before('get db connection', (done) => {
    ping().then((_db) => {
      db = _db;
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
      await billModel.findOneAndUpdate(db, { id: billId }, { $set: { balance: balance } });
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
      await billModel.findOneAndUpdate(db, { id: billId }, { $set: { balance: newBal } });
      const bill = await billModel.findById(db, billId);
      expect(bill).to.have.property('balance', newBal);
    });
    after('restore db values', async () => {
      await billModel.findOneAndUpdate(db, { id: billId }, { $set: { balance: balance } });
    });
  });

  after('close db connection', () => {
    // do nothing.
  });
});
