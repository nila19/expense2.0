'use strict';

import _ from 'lodash';
import moment from 'moment';

import { format } from 'config/formats';

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
    const month = moment(date, format.YYYYMMDD).startOf('month').format(format.YYYYMMDD);
    return buildMonth(month);
  });
};

// step 2.2 - check if current month is in the list, if not add it.
const addCurrentMonth = (months) => {
  const seq = buildMonth(moment().format(format.YYYYMMDD)).seq;
  if (!_.find(months, ['seq', seq])) {
    const month = moment().startOf('month').format(format.YYYYMMDD);
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
    name: moment(date, format.YYYYMMDD).format(year ? format.YYYY : format.MMMYY),
    seq: _.toNumber(moment(date, format.YYYYMMDD).format(format.YYYYMM)) + (year ? 1 : 0),
    year: _.toNumber(moment(date, format.YYYYMMDD).format(format.YYYY)),
  };
};

const buildYear = (month) => {
  const year = moment().year(month.year).endOf('year').startOf('day').format(format.YYYYMMDD);
  return buildMonth(year, true);
};
