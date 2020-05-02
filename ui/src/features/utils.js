import React from 'react';

import _ from 'lodash';

// @material-ui/icons
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import EuroIcon from '@material-ui/icons/Euro';

export const getSliceForPage = (data, page, rowsPerPage) => {
  const start = page * rowsPerPage;
  let end = (page + 1) * rowsPerPage;
  end = Math.min(end, data.length);
  return _.slice(data, start, end);
};

export const filterExpenses = (expenses, account, bill) => {
  let filtered = account
    ? expenses.filter(
        (e) => (e.accounts.from && e.accounts.from.id === account) || (e.accounts.to && e.accounts.to.id === account)
      )
    : expenses;
  filtered = bill ? filtered.filter((e) => e.bill && e.bill.id === bill) : filtered;
  return filtered;
};

export const filterBills = (bills, paid, account) => {
  let filtered = bills.filter((e) => e.closed).filter((e) => (paid ? e.balance <= 0 : e.balance > 0));
  filtered = account ? filtered.filter((e) => e.account.id === account) : filtered;
  return filtered;
};

export const getTotalAmount = (list) => {
  return _.reduce(list, (sum, e) => sum + e.amount, 0);
};

export const buildCityIcon = (currency) => {
  switch (currency) {
    case 'USD':
      return <AttachMoneyIcon />;
    case 'INR':
      return <EuroIcon />;
    default:
      return '';
  }
};

export const buildCategoriesOptions = (categories) => {
  return categories.map((e) => ({ key: e.id, label: e.name }));
};

export const buildAccountOptions = (accounts) => {
  return accounts.map((e) => ({ key: e.id, label: e.name }));
};

export const buildBillOptions = (bills, accountId) => {
  const filteredBills = _.filter(bills, (e) => e.account.id === accountId);
  return filteredBills.map((e) => ({ key: e.id, label: e.account.name + ' : ' + e.billDt + ' #' + e.id }));
};

export const buildMonthOptions = (months) => {
  return months.map((e) => ({ key: e.id, label: e.name }));
};

export const buildAdhocOptions = () => {
  return ['Y', 'N'].map((e) => ({ key: e, label: e }));
};

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
  AMOUNT_SYMBOL: '$ 0,0.00',
};
