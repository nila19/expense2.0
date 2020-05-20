/* eslint no-magic-numbers: "off" */

'use strict';

import { should, use, expect } from 'chai';
import 'regenerator-runtime/runtime.js';

import { buildMonth, buildMonthsList } from 'utils/month-utils';

should();
use(require('chai-things'));

describe('utils.month-utils', () => {
  describe('getMonth', () => {
    it('should be equal to month obj', () => {
      const result = { id: '2017-02-01', aggregate: false, name: 'Feb-17', seq: 201702, year: 2017 };
      expect(buildMonth('2017-02-01', false)).to.deep.equal(result);
    });
    it('should be equal to year obj', () => {
      const result = { id: '2016-12-31', aggregate: true, name: '2016', seq: 201613, year: 2016 };
      expect(buildMonth('2016-12-31', true)).to.deep.equal(result);
    });
  });
  describe('buildMonthsList', () => {
    it('should add current month with multiple years and sort them..', () => {
      const input = ['2015-03-21', '2015-02-01', '2016-04-15'];
      // note: the first 2 dates should be based on current month when the test is run.
      const output = [
        { id: '2020-12-31', aggregate: true, name: '2020', seq: 202013, year: 2020 },
        { id: '2020-05-01', aggregate: false, name: 'May-20', seq: 202005, year: 2020 },
        { id: '2016-12-31', aggregate: true, name: '2016', seq: 201613, year: 2016 },
        { id: '2016-04-01', aggregate: false, name: 'Apr-16', seq: 201604, year: 2016 },
        { id: '2015-12-31', aggregate: true, name: '2015', seq: 201513, year: 2015 },
        { id: '2015-03-01', aggregate: false, name: 'Mar-15', seq: 201503, year: 2015 },
        { id: '2015-02-01', aggregate: false, name: 'Feb-15', seq: 201502, year: 2015 },
      ];

      const result = buildMonthsList(input, console);
      expect(result).to.deep.equal(output);
    });
  });
});
