'use strict';

import moment from 'moment';
import { waterfall } from 'async';
import _ from 'lodash';

import { logErr } from './common-utils';
import { YYYY, MMMYY, YYYYMM, YYYYMMDD } from '../config/formats';

// utility methods to generate appropriate json..
export const getMonth = (date, year = false) => {
  return {
    id: date,
    bills: null,
    aggregate: year,
    name: moment(date).format(year ? YYYY : MMMYY),
    seq: _.toNumber(moment(date).format(YYYYMM)) + (year ? 1 : 0),
    year: _.toNumber(moment(date).format(YYYY))
  };
};

// step 2.0 - build the months array structure.
export const buildMonthsList = (dates, log) => {
  return new Promise((resolve, reject) => {
    waterfall([cb => cb(null, dates), buildMonths, addCurrentMonth, addYears, sortMonths], (err, months) => {
      if (err) {
        logErr(log, err);
        return reject(err);
      }
      return resolve(months);
    });
  });
};

// step 2.1 - build the initial months list.
const buildMonths = (dates, next) => {
  const months = dates.map(date => {
    const month = moment(date)
      .startOf('month')
      .format(YYYYMMDD);
    getMonth(month);
  });
  return next(null, months);
};

// step 2.2 - check if current month is in the list, if not add it.
const addCurrentMonth = (months, next) => {
  const seq = getMonth(moment().format(YYYYMMDD)).seq;
  if (!_.find(months, ['seq', seq])) {
    const month = moment()
      .startOf('month')
      .format(YYYYMMDD);
    months.push(getMonth(month));
  }
  return next(null, months);
};

const buildYear = month => {
  const year = moment()
    .year(month.year)
    .endOf('year')
    .startOf('day')
    .format(YYYYMMDD);
  return getMonth(year, true);
};

// step 2.3 - extract all years from the months list & add them to the list..
const addYears = (months, next) => {
  const years = _.uniqBy(months, 'year');
  _.forEach(years, year => {
    months.push(buildYear(year));
  });
  return next(null, months);
};

// step 2.4 - sort the months list based on the 'seq' in reverse.
const sortMonths = (months, next) => {
  return next(null, _.orderBy(months, ['seq'], ['desc']));
};
