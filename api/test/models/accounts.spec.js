/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';

import { should, use, expect } from 'chai';
import 'regenerator-runtime/runtime.js';

import { ping } from 'config/mongodb-config';
import { accountModel } from 'data/models';

should();
use(require('chai-things'));

describe('models.accounts', () => {
  const cityId = 20140301;
  const acctId = 81;
  let db = null;

  before('get db connection', (done) => {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('findForCity', () => {
    it('should fetch all active accounts = 9', async () => {
      const accts = await accountModel.findForCity(db, cityId);
      accts.should.all.have.property('active', true);
    });
  });
  describe('update', () => {
    const newBal = 10;
    let balance = 0;

    before('backup db values', async () => {
      const acct = await accountModel.findById(db, acctId);
      balance = acct.balance;
    });
    it('should update account', async () => {
      await accountModel.findOneAndUpdate(db, { id: acctId }, { $set: { balance: newBal } });
      const acct = await accountModel.findById(db, acctId);
      expect(acct).to.have.property('balance', newBal);
    });
    after('restore db values', async () => {
      await accountModel.findOneAndUpdate(db, { id: acctId }, { $set: { balance: balance } });
    });
  });

  after('close db connection', () => {
    // do nothing.
  });
});
