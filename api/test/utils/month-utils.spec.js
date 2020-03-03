/* eslint no-magic-numbers: "off" */

'use strict';
import { expect } from 'chai';
import { getMonth, buildMonthsList } from '../../utils/month-utils';

// const chaiAsPromised = require('chai-as-promised');

// chai.use(chaiAsPromised);
// chai.should();

describe('utils.month-utils', function() {
  describe('getMonth', function() {
    it('should be equal to month obj', function() {
      const result = { id: '2017-02-01', bills: null, aggregate: false, name: 'Feb-17', seq: 201702, year: 2017 };

      // expect(JSON.stringify(mu.getMonth('2017-02-01', false))).to.equal(JSON.stringify(result));
      expect(getMonth('2017-02-01', false)).to.deep.equal(result);
    });
    it('should be equal to year obj', function() {
      const result = { id: '2016-12-31', bills: null, aggregate: true, name: '2016', seq: 201613, year: 2016 };

      expect(getMonth('2016-12-31', true)).to.deep.equal(result);
    });
  });
  describe('buildMonthsList', function() {
    it('should add current month with multiple years and sort them..', function(done) {
      const input = ['2015-03-21', '2015-02-01', '2016-04-15'];
      const output = [
        { id: '2017-12-31', bills: null, aggregate: true, name: '2017', seq: 201713, year: 2017 },
        { id: '2017-06-01', bills: null, aggregate: false, name: 'Jun-17', seq: 201706, year: 2017 },
        { id: '2016-12-31', bills: null, aggregate: true, name: '2016', seq: 201613, year: 2016 },
        { id: '2016-04-01', bills: null, aggregate: false, name: 'Apr-16', seq: 201604, year: 2016 },
        { id: '2015-12-31', bills: null, aggregate: true, name: '2015', seq: 201513, year: 2015 },
        { id: '2015-03-01', bills: null, aggregate: false, name: 'Mar-15', seq: 201503, year: 2015 },
        { id: '2015-02-01', bills: null, aggregate: false, name: 'Feb-15', seq: 201502, year: 2015 }
      ];

      // return mu.buildMonthsList(input, console).should.eventually.deep.equal(output);
      buildMonthsList(input, console).then(result => {
        // console.log('==> ' + JSON.stringify(result) + ' <==');
        expect(result).to.deep.equal(output);
        done();
      });
    });
  });
});
