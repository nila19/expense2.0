/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';
import moment from 'moment';
import _ from 'lodash';
import { should, use, expect } from 'chai';

import { transactions } from '../../models/index';
import { ping } from '../../config/mongodb-config.js';

should();
use(require('chai-things'));

describe('models.transactions', () => {
  const cityId = 20140301;
  const acctId = 83;
  const billId = 95;
  const transId = 6975;
  let db = null;

  before('get db connection', (done) => {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('findForCity', () => {
    it('should fetch all transactions for city', async () => {
      const trans = await transactions.findForCity(db, cityId);
      trans.should.all.have.property('cityId', cityId);
    });
  });
  describe('findForAcct', () => {
    it('should fetch all transactions for bill', async () => {
      const trans = await transactions.findForAcct(db, cityId, acctId, billId);
      const bills = trans.map((t) => t.bill);
      bills.should.contain.some.with.property('id', billId);
    });
    it('should fetch all transactions for from/to account', async () => {
      const trans = await transactions.findForAcct(db, cityId, acctId, null);
      const accts = trans.map((t) => (t.accounts.from.id === acctId ? t.accounts.from : t.accounts.to));
      accts.should.all.have.property('id', acctId);
    });
  });
  describe('findPrevious', () => {
    const seq = 8479;
    const prevSeq = 8462;

    it('should fetch previous transaction for account', async () => {
      const tran = await transactions.findPrevious(db, cityId, acctId, seq);
      const ac = tran.accounts.from.id === acctId ? tran.accounts.from : tran.accounts.to;
      expect(ac).to.have.property('id', acctId);
      expect(tran.seq).to.be.below(seq);
      expect(tran).to.have.property('seq', prevSeq);
    });
  });
  describe('findForMonthlySummary', () => {
    it('should fetch transaction for monthly summary - regular', async () => {
      const trans = await transactions.findForMonthlySummary(db, cityId, true, false);
      trans.should.all.have.property('cityId', cityId);
      trans.should.all.have.property('adhoc', false);
    });
    it('should fetch transaction for monthly summary - adhoc', async () => {
      const trans = await transactions.findForMonthlySummary(db, cityId, false, true);
      trans.should.all.have.property('cityId', cityId);
      trans.should.all.have.property('adhoc', true);
    });
    it('should fetch transaction for monthly summary - regular + adhoc', async () => {
      const trans = await transactions.findForMonthlySummary(db, cityId, true, true);
      trans.should.all.have.property('cityId', cityId);
      trans.should.all.have.property('adjust', false);
    });
    it('should fetch transaction for monthly summary - regular + adhoc', async () => {
      const trans = await transactions.findForMonthlySummary(db, cityId, false, false);
      trans.should.all.have.property('cityId', cityId);
      trans.should.all.have.property('adjust', false);
    });
  });
  describe('findForForecast', () => {
    const thisMth = moment().date(1);
    const beginMth = _.toNumber(thisMth.clone().subtract(4, 'months').format('YYYYMMDD'));
    const endMth = _.toNumber(thisMth.clone().subtract(1, 'months').format('YYYYMMDD'));

    it('should fetch transaction for forecast', async () => {
      const trans = await transactions.findForForecast(db, cityId);
      trans.should.all.have.property('cityId', cityId);
      trans.should.all.have.property('adhoc', false);
      trans.should.all.have.property('adjust', false);
      const dates = trans.map((t) => {
        const mth = _.split(t.transMonth, '-');
        return _.toNumber(mth[0] + mth[1] + mth[2]);
      });
      dates.should.all.be.within(beginMth, endMth);
    });
  });
  describe('update', () => {
    const transId = 10956;
    const newAmt = 10;
    let oldAmt = 0;

    before('backup db values', async () => {
      const tran = await transactions.findById(db, transId);
      oldAmt = tran.amount;
    });
    it('should update transaction', async () => {
      await transactions.updateOne(db, { id: transId }, { $set: { amount: newAmt } });
      const tran = await transactions.findById(db, transId);
      expect(tran).to.have.property('amount', newAmt);
    });
    after('restore db values', async () => {
      await transactions.updateOne(db, { id: transId }, { $set: { amount: oldAmt } });
    });
  });
  describe('findForSearch', () => {
    const catId = 181;
    const description = 'Kroger';
    let query = null;

    it('should fetch for search', async () => {
      const trans = await transactions.findForSearch(db, { cityId: cityId });
      trans.should.all.have.property('cityId', cityId);
    });
    it('should fetch for search - limit 100', async () => {
      const trans = await transactions.findForSearch(db, { cityId: cityId, thinList: 'true' });
      expect(trans).to.have.lengthOf(100);
      trans.should.all.have.property('cityId', cityId);
    });
    it('should fetch for acctId', async () => {
      query = { cityId: cityId, thinList: 'true', acctId: acctId };
      const trans = await transactions.findForSearch(db, query);
      const accts = trans.map((t) => (t.accounts.from.id === acctId ? t.accounts.from : t.accounts.to));
      accts.should.all.have.property('id', acctId);
      trans.should.all.have.property('cityId', cityId);
    });
    it('should fetch for billId', async () => {
      query = { cityId: cityId, thinList: 'true', billId: billId };
      const trans = await transactions.findForSearch(db, query);
      trans.map((t) => t.bill).should.all.have.property('id', billId);
    });
    it('should fetch for categoryId', async () => {
      query = { cityId: cityId, thinList: 'true', catId: catId };
      const trans = await transactions.findForSearch(db, query);
      trans.map((t) => t.category).should.all.have.property('id', catId);
    });
    it('should fetch for description', async () => {
      query = { cityId: cityId, thinList: 'true', description: description };
      const trans = await transactions.findForSearch(db, query);
      trans.should.contain.some.with.property('description', description);
    });
    it('should fetch for amount', async () => {
      query = { cityId: cityId, thinList: 'true', amount: 100 };
      const trans = await transactions.findForSearch(db, query);
      trans.map((t) => t.amount).should.all.be.within(100 * 0.75, 100 * 1.75);
    });
    it('should fetch for adhoc = Y', async () => {
      query = { cityId: cityId, thinList: 'true', adhoc: 'Y' };
      const trans = await transactions.findForSearch(db, query);
      trans.should.all.have.property('adhoc', true);
    });
    it('should fetch for adhoc = N', async () => {
      query = { cityId: cityId, thinList: 'true', adhoc: 'N' };
      const trans = await transactions.findForSearch(db, query);
      trans.should.all.have.property('adhoc', false);
    });
    it('should fetch for adjust = Y', async () => {
      query = { cityId: cityId, thinList: 'true', adjust: 'Y' };
      const trans = await transactions.findForSearch(db, query);
      trans.should.all.have.property('adjust', true);
    });
    it('should fetch for adjust = N', async () => {
      query = { cityId: cityId, thinList: 'true', adjust: 'N' };
      const trans = await transactions.findForSearch(db, query);
      trans.should.all.have.property('adjust', false);
    });
    it('should fetch for entryMonth', async () => {
      query = { cityId: cityId, thinList: 'true', entryMonth: '2015-09-01', entryYear: 'false' };
      const mth = moment(query.entryMonth);
      const beginDt = _.toNumber(mth.clone().startOf('month').format('YYYYMMDD'));
      const endDt = _.toNumber(mth.clone().endOf('months').format('YYYYMMDD'));

      const trans = await transactions.findForSearch(db, query);
      const dates = trans.map((t) => {
        const mth = _.split(t.entryMonth, '-');
        return _.toNumber(mth[0] + mth[1] + mth[2]);
      });
      dates.should.all.be.within(beginDt, endDt);
    });
    it('should fetch for entryMonth, year = true', async () => {
      query = { cityId: cityId, thinList: 'true', entryMonth: '2015-12-31', entryYear: 'true' };
      const mth = moment(query.entryMonth);
      const beginDt = _.toNumber(mth.clone().startOf('year').format('YYYYMMDD'));
      const endDt = _.toNumber(mth.clone().endOf('year').format('YYYYMMDD'));

      const trans = await transactions.findForSearch(db, query);
      const dates = trans.map((t) => {
        const mth = _.split(t.entryMonth, '-');
        return _.toNumber(mth[0] + mth[1] + mth[2]);
      });
      dates.should.all.be.within(beginDt, endDt);
    });
    it('should fetch for transMonth', async () => {
      query = { cityId: cityId, thinList: 'true', transMonth: '2015-09-01', transYear: 'false' };
      const mth = moment(query.transMonth);
      const beginDt = _.toNumber(mth.clone().startOf('month').format('YYYYMMDD'));
      const endDt = _.toNumber(mth.clone().endOf('months').format('YYYYMMDD'));

      const trans = await transactions.findForSearch(db, query);
      const dates = trans.map((t) => {
        const mth = _.split(t.transMonth, '-');
        return _.toNumber(mth[0] + mth[1] + mth[2]);
      });
      dates.should.all.be.within(beginDt, endDt);
    });
    it('should fetch for entryMonth, year = true', async () => {
      query = { cityId: cityId, thinList: 'true', transMonth: '2015-12-31', transYear: 'true' };
      const mth = moment(query.transMonth);
      const beginDt = _.toNumber(mth.clone().startOf('year').format('YYYYMMDD'));
      const endDt = _.toNumber(mth.clone().endOf('year').format('YYYYMMDD'));

      const trans = await transactions.findForSearch(db, query);
      const dates = trans.map((t) => {
        const mth = _.split(t.transMonth, '-');
        return _.toNumber(mth[0] + mth[1] + mth[2]);
      });
      dates.should.all.be.within(beginDt, endDt);
    });
  });

  after('close db connection', () => {
    // do nothing.
  });
});
