import _ from 'lodash';
import moment from 'moment';
import memoize from 'memoize-one';

export const filterAndSortBills = memoize((bills, closed, paid, account) => {
  console.log('Filtering bills..');
  let filtered = bills.filter((e) => e.closed === closed);
  filtered = closed ? filtered.filter((e) => (paid ? e.balance <= 0 : e.balance > 0)) : filtered;
  filtered = account ? filtered.filter((e) => e.account.id === account) : filtered;

  let sorted =
    closed === false
      ? _.sortBy(filtered, 'billDt')
      : paid
      ? _.reverse(_.sortBy(filtered, 'dueDt'))
      : _.sortBy(filtered, 'dueDt');
  return sorted;
});

export const hasBillsToClose = memoize((bills) => {
  console.log('Has bills to close..');
  return _.some(bills, (e) => !e.closed && moment().isAfter(e.billDt, 'day'));
});

export const hasBillsToPay = memoize((bills) => {
  console.log('Has bills to pay..');
  return _.some(bills, (e) => e.closed && e.balance);
});
