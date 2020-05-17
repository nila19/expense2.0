'use strict';

import _ from 'lodash';
import moment from 'moment';

import { FORMAT } from 'config/formats';

// step 2.0 - build the months array structure.
export const buildMonthsList = (dates) => {
  const months = buildMonths(dates);
  addCurrentMonth(months);
  addYears(months);
  return sortMonths(months);
};

// step 2.1 - build the initial months list.
const buildMonths = (dates) => {
  return dates.map((date) => {
    const month = moment(date, FORMAT.YYYYMMDD).startOf('month').format(FORMAT.YYYYMMDD);
    return buildMonth(month);
  });
};

// step 2.2 - check if current month is in the list, if not add it.
const addCurrentMonth = (months) => {
  const seq = buildMonth(moment().format(FORMAT.YYYYMMDD)).seq;
  if (!_.find(months, ['seq', seq])) {
    const month = moment().startOf('month').format(FORMAT.YYYYMMDD);
    months.push(buildMonth(month));
  }
};

// step 2.3 - extract all years from the months list & add them to the list..
const addYears = (months) => {
  const years = _.uniqBy(months, 'year');
  _.forEach(years, (year) => {
    months.push(buildYear(year));
  });
};

// step 2.4 - sort the months list based on the 'seq' in reverse.
const sortMonths = (months) => {
  return _.orderBy(months, ['seq'], ['desc']);
};

// utility methods to generate appropriate json..
export const buildMonth = (date, year = false) => {
  return {
    id: date,
    aggregate: year,
    name: moment(date, FORMAT.YYYYMMDD).format(year ? FORMAT.YYYY : FORMAT.MMMYY),
    seq: _.toNumber(moment(date, FORMAT.YYYYMMDD).format(FORMAT.YYYYMM)) + (year ? 1 : 0),
    year: _.toNumber(moment(date, FORMAT.YYYYMMDD).format(FORMAT.YYYY)),
  };
};

const buildYear = (month) => {
  const year = moment().year(month.year).endOf('year').startOf('day').format(FORMAT.YYYYMMDD);
  return buildMonth(year, true);
};
