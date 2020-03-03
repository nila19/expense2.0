/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';
import moment from 'moment';
import _ from 'lodash';
import { should, use, expect } from 'chai';

import Transactions from '../../models/Transactions';
import { ping } from '../../config/mongodb-config.js';

should();
use(require('chai-things'));

const transactions = Transactions();

describe('models.transactions', function() {
  const cityId = 20140301;
  const acctId = 83;
  const billId = 95;
  const transId = 6975;
  let db = null;

  before('get db connection', function(done) {
    ping(null, function(err, db1) {
      db = db1;
      done();
    });
  });
  describe('findForCity', function() {
    it('should fetch all transactions for city', function(done) {
      transactions.findForCity(db, cityId).then(trans => {
        trans.should.all.have.property('cityId', cityId);
        done();
      });
    });
  });
  describe('findForAcct', function() {
    it('should fetch all transactions for bill', function(done) {
      transactions.findForAcct(db, cityId, acctId, billId).then(trans => {
        trans.map(t => t.bill).should.contain.some.with.property('id', billId);
        done();
      });
    });
    it('should fetch all transactions for from/to account', function(done) {
      transactions.findForAcct(db, cityId, acctId, null).then(trans => {
        const accts = trans.map(t => (t.accounts.from.id === acctId ? t.accounts.from : t.accounts.to));

        accts.should.all.have.property('id', acctId);
        done();
      });
    });
  });
  describe('findPrevious', function() {
    const seq = 8479;
    const prevSeq = 8462;

    it('should fetch previous transaction for account', function(done) {
      transactions.findPrevious(db, cityId, acctId, seq).then(tran => {
        const ac = tran.accounts.from.id === acctId ? tran.accounts.from : tran.accounts.to;

        expect(ac).to.have.property('id', acctId);
        expect(tran.seq).to.be.below(seq);
        expect(tran).to.have.property('seq', prevSeq);
        done();
      });
    });
  });
  describe('findForMonthlySummary', function() {
    it('should fetch transaction for monthly summary - regular', function(done) {
      transactions.findForMonthlySummary(db, cityId, true, false).then(trans => {
        trans.should.all.have.property('cityId', cityId);
        trans.should.all.have.property('adhoc', false);
        done();
      });
    });
    it('should fetch transaction for monthly summary - adhoc', function(done) {
      transactions.findForMonthlySummary(db, cityId, false, true).then(trans => {
        trans.should.all.have.property('cityId', cityId);
        trans.should.all.have.property('adhoc', true);
        done();
      });
    });
    it('should fetch transaction for monthly summary - regular + adhoc', function(done) {
      transactions.findForMonthlySummary(db, cityId, true, true).then(trans => {
        trans.should.all.have.property('cityId', cityId);
        trans.should.all.have.property('adjust', false);
        done();
      });
    });
    it('should fetch transaction for monthly summary - regular + adhoc', function(done) {
      transactions.findForMonthlySummary(db, cityId, false, false).then(trans => {
        trans.should.all.have.property('cityId', cityId);
        trans.should.all.have.property('adjust', false);
        done();
      });
    });
  });
  describe('findForForecast', function() {
    const thisMth = moment().date(1);
    const beginMth = _.toNumber(
      thisMth
        .clone()
        .subtract(4, 'months')
        .format('YYYYMMDD')
    );
    const endMth = _.toNumber(
      thisMth
        .clone()
        .subtract(1, 'months')
        .format('YYYYMMDD')
    );

    it('should fetch transaction for forecast', function(done) {
      transactions.findForForecast(db, cityId).then(trans => {
        trans.should.all.have.property('cityId', cityId);
        trans.should.all.have.property('adhoc', false);
        trans.should.all.have.property('adjust', false);
        const dates = trans.map(t => {
          const mth = _.split(t.transMonth, '-');

          return _.toNumber(mth[0] + mth[1] + mth[2]);
        });

        dates.should.all.be.within(beginMth, endMth);
        done();
      });
    });
  });
  describe('update', function() {
    const newAmt = 10;
    let oldAmt = 0;
    let trans = 0;

    before('backup db values', function(done) {
      transactions.findById(db, transId).then(t => {
        trans = t;
        oldAmt = t.amount;
        done();
      });
    });
    it('should update transaction', function(done) {
      trans.amount = newAmt;
      transactions.updateTrans(db, trans).then(() => {
        transactions.findById(db, transId).then(t => {
          expect(t).to.have.property('amount', newAmt);
          done();
        });
      });
    });
    after('restore db values', function(done) {
      trans.amount = oldAmt;
      transactions.updateTrans(db, trans).then(() => {
        done();
      });
    });
  });
  describe('findForSearch', function() {
    const catId = 181;
    const description = 'Kroger';
    let qry = null;

    it('should fetch for search', function(done) {
      transactions.findForSearch(db, { cityId: cityId }).then(trans => {
        trans.should.all.have.property('cityId', cityId);
        done();
      });
    });
    it('should fetch for search - limit 100', function(done) {
      transactions.findForSearch(db, { cityId: cityId, thinList: 'true' }).then(trans => {
        expect(trans).to.have.lengthOf(100);
        trans.should.all.have.property('cityId', cityId);
        done();
      });
    });
    it('should fetch for acctId', function(done) {
      qry = { cityId: cityId, thinList: 'true', acctId: acctId };
      transactions.findForSearch(db, qry).then(trans => {
        const accts = trans.map(t => (t.accounts.from.id === acctId ? t.accounts.from : t.accounts.to));

        accts.should.all.have.property('id', acctId);
        trans.should.all.have.property('cityId', cityId);
        done();
      });
    });
    it('should fetch for billId', function(done) {
      qry = { cityId: cityId, thinList: 'true', billId: billId };
      transactions.findForSearch(db, qry).then(trans => {
        trans.map(t => t.bill).should.all.have.property('id', billId);
        done();
      });
    });
    it('should fetch for categoryId', function(done) {
      qry = { cityId: cityId, thinList: 'true', catId: catId };
      transactions.findForSearch(db, qry).then(trans => {
        trans.map(t => t.category).should.all.have.property('id', catId);
        done();
      });
    });
    it('should fetch for description', function(done) {
      qry = { cityId: cityId, thinList: 'true', description: description };
      transactions.findForSearch(db, qry).then(trans => {
        trans.should.contain.some.with.property('description', description);
        done();
      });
    });
    it('should fetch for amount', function(done) {
      qry = { cityId: cityId, thinList: 'true', amount: 100 };
      transactions.findForSearch(db, qry).then(trans => {
        trans.map(t => t.amount).should.all.be.within(100 * 0.75, 100 * 1.75);
        done();
      });
    });
    it('should fetch for adhoc = Y', function(done) {
      qry = { cityId: cityId, thinList: 'true', adhoc: 'Y' };
      transactions.findForSearch(db, qry).then(trans => {
        trans.should.all.have.property('adhoc', true);
        done();
      });
    });
    it('should fetch for adhoc = N', function(done) {
      qry = { cityId: cityId, thinList: 'true', adhoc: 'N' };
      transactions.findForSearch(db, qry).then(trans => {
        trans.should.all.have.property('adhoc', false);
        done();
      });
    });
    it('should fetch for adjust = Y', function(done) {
      qry = { cityId: cityId, thinList: 'true', adjust: 'Y' };
      transactions.findForSearch(db, qry).then(trans => {
        trans.should.all.have.property('adjust', true);
        done();
      });
    });
    it('should fetch for adjust = N', function(done) {
      qry = { cityId: cityId, thinList: 'true', adjust: 'N' };
      transactions.findForSearch(db, qry).then(trans => {
        trans.should.all.have.property('adjust', false);
        done();
      });
    });
    it('should fetch for entryMonth', function(done) {
      qry = { cityId: cityId, thinList: 'true', entryMonth: '2015-09-01', entryYear: 'false' };
      const mth = moment(qry.entryMonth);
      const beginDt = _.toNumber(
        mth
          .clone()
          .startOf('month')
          .format('YYYYMMDD')
      );
      const endDt = _.toNumber(
        mth
          .clone()
          .endOf('months')
          .format('YYYYMMDD')
      );

      transactions.findForSearch(db, qry).then(trans => {
        const dates = trans.map(t => {
          const mth = _.split(t.entryMonth, '-');

          return _.toNumber(mth[0] + mth[1] + mth[2]);
        });

        dates.should.all.be.within(beginDt, endDt);
        done();
      });
    });
    it('should fetch for entryMonth, year = true', function(done) {
      qry = { cityId: cityId, thinList: 'true', entryMonth: '2015-12-31', entryYear: 'true' };
      const mth = moment(qry.entryMonth);
      const beginDt = _.toNumber(
        mth
          .clone()
          .startOf('year')
          .format('YYYYMMDD')
      );
      const endDt = _.toNumber(
        mth
          .clone()
          .endOf('year')
          .format('YYYYMMDD')
      );

      transactions.findForSearch(db, qry).then(trans => {
        const dates = trans.map(t => {
          const mth = _.split(t.entryMonth, '-');

          return _.toNumber(mth[0] + mth[1] + mth[2]);
        });

        dates.should.all.be.within(beginDt, endDt);
        done();
      });
    });
    it('should fetch for transMonth', function(done) {
      qry = { cityId: cityId, thinList: 'true', transMonth: '2015-09-01', transYear: 'false' };
      const mth = moment(qry.transMonth);
      const beginDt = _.toNumber(
        mth
          .clone()
          .startOf('month')
          .format('YYYYMMDD')
      );
      const endDt = _.toNumber(
        mth
          .clone()
          .endOf('months')
          .format('YYYYMMDD')
      );

      transactions.findForSearch(db, qry).then(trans => {
        const dates = trans.map(t => {
          const mth = _.split(t.transMonth, '-');

          return _.toNumber(mth[0] + mth[1] + mth[2]);
        });

        dates.should.all.be.within(beginDt, endDt);
        done();
      });
    });
    it('should fetch for entryMonth, year = true', function(done) {
      qry = { cityId: cityId, thinList: 'true', transMonth: '2015-12-31', transYear: 'true' };
      const mth = moment(qry.transMonth);
      const beginDt = _.toNumber(
        mth
          .clone()
          .startOf('year')
          .format('YYYYMMDD')
      );
      const endDt = _.toNumber(
        mth
          .clone()
          .endOf('year')
          .format('YYYYMMDD')
      );

      transactions.findForSearch(db, qry).then(trans => {
        const dates = trans.map(t => {
          const mth = _.split(t.transMonth, '-');

          return _.toNumber(mth[0] + mth[1] + mth[2]);
        });

        dates.should.all.be.within(beginDt, endDt);
        done();
      });
    });
  });

  after('close db connection', function() {
    // do nothing.
  });
});
