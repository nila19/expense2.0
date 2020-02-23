'use strict';

const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const cu = require('./common-utils');
const fmt = require('../config/formats');

// utility methods to generate appropriate json..
const getMonth = function (date, year) {
  return {
    id: date,
    bills: null,
    aggregate: year,
    name: moment(date).format(year ? fmt.YYYY : fmt.MMMYY),
    seq: _.toNumber(moment(date).format(fmt.YYYYMM)) + (year ? 1 : 0),
    year: _.toNumber(moment(date).format(fmt.YYYY))
  };
};

// step 2.0 - build the months array structure.
const buildMonthsList = function (dates, log) {
  return new Promise(function (resolve, reject) {
    async.waterfall([function (cb) {
      return cb(null, dates);
    }, buildMonths, addCurrentMonth, addYears, sortMonths], function (err, months) {
      if (err) {
        cu.logErr(log, err);
        return reject(err);
      }
      return resolve(months);
    });
  });
};

// step 2.1 - build the initial months list.
const buildMonths = function (dates, next) {
  const months = [];

  dates.forEach(function (date) {
    months.push(getMonth(moment(date).startOf('month').format(fmt.YYYYMMDD), false));
  });
  return next(null, months);
};

// step 2.2 - check if current month is in the list, if not add it.
const addCurrentMonth = function (months, next) {
  if (!_.find(months, ['seq', getMonth(moment().format(fmt.YYYYMMDD), false).seq])) {
    months.push(getMonth(moment().startOf('month').format(fmt.YYYYMMDD), false));
  }
  return next(null, months);
};

// step 2.3 - extract all years from the months list & add them to the list..
const addYears = function (months, next) {
  _.forEach(_.uniqBy(months, 'year'), function (m) {
    months.push(getMonth(moment().year(m.year).endOf('year').startOf('day').format(fmt.YYYYMMDD), true));
  });
  return next(null, months);
};

// step 2.4 - sort the months list based on the 'seq' in reverse.
const sortMonths = function (months, next) {
  return next(null, _.orderBy(months, ['seq'], ['desc']));
};

module.exports = {
  buildMonthsList: buildMonthsList,
  getMonth: getMonth
};
