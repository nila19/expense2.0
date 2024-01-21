import _ from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import BigNumber from 'bignumber.js';
import memoize from 'memoize-one';
import * as Yup from 'yup';

import { FORMATS } from 'app/constants';

export const getSliceForPage = memoize((data, page, rowsPerPage) => {
  const start = page * rowsPerPage;
  let end = (page + 1) * rowsPerPage;
  end = Math.min(end, data.length);
  return _.slice(data, start, end);
});

export const getTotalAmount = memoize((list) => {
  return _.reduce(list, (sum, e) => sum + e.amount, 0);
});

export const buildCategoriesOptions = memoize((categories) => {
  return categories.map((e) => ({ key: e.id, label: e.name }));
});

export const buildAccountOptions = memoize((accounts) => {
  return accounts.map((e) => ({ key: e.id, label: e.name }));
});

export const buildBillOptions = memoize((bills, accountId) => {
  const filteredBills = _.filter(bills, (e) => e.account.id === accountId);
  return filteredBills.map((e) => ({
    key: e.id,
    label: e.account.name + ' : ' + e.billDt + ' #' + e.id,
  }));
});

export const buildMonthOptions = memoize((months) => {
  return months.map((e) => ({ key: e.id, label: e.name }));
});

export const buildAdhocOptions = memoize(() => {
  return ['Y', 'N'].map((e) => ({ key: e, label: e }));
});

export const prepareChartData = (chartData) => {
  const { labels, regulars, adhocs, totals } = chartData;
  return labels.slice(0, 24).map((e, idx) => ({
    label: e,
    regular: regulars[idx],
    adhoc: adhocs[idx],
    total: totals[idx],
  }));
};

export const formatLabel = memoize((label) => {
  return _.capitalize(label);
});

export const formatAmt = memoize((amount, symbol, noDecimal) => {
  const amt = new BigNumber(amount).toFixed(2);
  const fmt = symbol
    ? noDecimal
      ? FORMATS.AMOUNT_SYMBOL_2
      : FORMATS.AMOUNT_SYMBOL
    : noDecimal
    ? FORMATS.AMOUNT_2
    : FORMATS.AMOUNT;
  return numeral(amt).format(fmt);
});

export const formatDate = memoize((date, fmt) => {
  if (_.isEmpty(date)) {
    return '';
  }
  return moment(date, FORMATS.YYYYMMDD).format(fmt || FORMATS.DDMMMYYYY);
});

export const entrySchema = Yup.object().shape({
  // category: Yup.object({
  //   id: Yup.number().when('adjust', {
  //     is: false,
  //     then: Yup.number().required('Required'),
  //   }),
  // }),
  description: Yup.string().required('Required').trim().min(2, 'Min length'),
  transDt: Yup.string().required('Required'),
  amount: Yup.number().required('Required').notOneOf([0]),
  accounts: Yup.object({
    from: Yup.object({
      id: Yup.number().required('Required'),
    }),
  }),
});

export const editSchema = Yup.object({
  category: Yup.object({
    id: Yup.number().when('adjust', {
      is: false,
      then: Yup.number().required('Required'),
    }),
  }),
  bill: Yup.object({
    id: Yup.number().when('billed', {
      is: true,
      then: Yup.number().required('Required'),
    }),
  }),
  description: Yup.string().required('Required').trim().min(2, 'Min length'),
  transDt: Yup.string().required('Required'),
  amount: Yup.number().required('Required').notOneOf([0]),
  accounts: Yup.object({
    from: Yup.object({
      id: Yup.number().required('Required'),
    }),
  }),
});

export const acctSchema = Yup.object().shape({
  name: Yup.string().required('Required').trim().min(2, 'Min length'),
  cash: Yup.string().required('Required'),
  billed: Yup.string().required('Required'),
  icon: Yup.string().required('Required'),
  color: Yup.string().required('Required'),
  seq: Yup.number().required('Required'),
  closingDay: Yup.number().required('Required'),
  dueDay: Yup.number().required('Required'),
  balance: Yup.number().required('Required'),
  active: Yup.string().required('Required'),
});
