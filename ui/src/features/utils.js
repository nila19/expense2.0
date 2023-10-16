import _ from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import BigNumber from 'bignumber.js';
import memoize from 'memoize-one';
import * as Yup from 'yup';

export const getSliceForPage = memoize((data, page, rowsPerPage) => {
  const start = page * rowsPerPage;
  let end = (page + 1) * rowsPerPage;
  end = Math.min(end, data.length);
  return _.slice(data, start, end);
});

export const getTotalAmount = memoize((list) => {
  console.log('Calculating total.. ' + list.length);
  return _.reduce(list, (sum, e) => sum + e.amount, 0);
});

export const buildCategoriesOptions = memoize((categories) => {
  console.log('Building categories options');
  return categories.map((e) => ({ key: e.id, label: e.name }));
});

export const buildAccountOptions = memoize((accounts) => {
  console.log('Building accounts options');
  return accounts.map((e) => ({ key: e.id, label: e.name }));
});

export const buildBillOptions = memoize((bills, accountId) => {
  console.log('Building bills options');
  const filteredBills = _.filter(bills, (e) => e.account.id === accountId);
  return filteredBills.map((e) => ({ key: e.id, label: e.account.name + ' : ' + e.billDt + ' #' + e.id }));
});

export const buildMonthOptions = memoize((months) => {
  console.log('Building months options');
  return months.map((e) => ({ key: e.id, label: e.name }));
});

export const buildAdhocOptions = memoize(() => {
  console.log('Building adhoc options');
  return ['Y', 'N'].map((e) => ({ key: e, label: e }));
});

export const prepareChartData = (chartData) => {
  const { labels, regulars, adhocs, totals } = chartData;
  return labels
    .slice(0, 24)
    .map((e, idx) => ({ label: e, regular: regulars[idx], adhoc: adhocs[idx], total: totals[idx] }));
};

export const formatLabel = memoize((label) => {
  return _.capitalize(label);
});

export const formatAmt = memoize((amount, symbol, noDecimal) => {
  const amt = new BigNumber(amount).toFixed(2);
  const fmt = symbol
    ? noDecimal
      ? format.AMOUNT_SYMBOL_2
      : format.AMOUNT_SYMBOL
    : noDecimal
    ? format.AMOUNT_2
    : format.AMOUNT;
  return numeral(amt).format(fmt);
});

export const formatDate = memoize((date, fmt) => {
  return moment(date, format.YYYYMMDD).format(fmt || format.DDMMMYYYY);
});

export const format = {
  YYYYMMDD: 'YYYY-MM-DD',
  YYYYMMDDHHmmss: 'YYYY-MM-DDTHH:mm:ssZ',
  DDMMMYYYY: 'DD-MMM-YYYY',
  DDMMMYYYYHHMM: 'DD-MMM-YYYY hh:mm A',
  DDMMM: 'DD-MMM',
  YYYY: 'YYYY',
  YYYYMM: 'YYYYMM',
  MMMYY: 'MMM-YY',
  AMOUNT: '0,0.00',
  AMOUNT_2: '0,0',
  AMOUNT_SYMBOL: '$ 0,0.00',
  AMOUNT_SYMBOL_2: '$ 0,0',
};

export const entrySchema = Yup.object().shape({
  category: Yup.object({
    id: Yup.number().when('adjust', {
      is: false,
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
