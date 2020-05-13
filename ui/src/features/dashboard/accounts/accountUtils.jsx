import React from 'react';

import _ from 'lodash';
import moment from 'moment';
import memoize from 'memoize-one';

// @material-ui/icons
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import MuseumIcon from '@material-ui/icons/Museum';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import SubtitlesIcon from '@material-ui/icons/Subtitles';

import { COUNTS } from 'app/config';
import { format, formatAmt, formatDate } from 'features/utils';

export const buildAccountIcon = memoize((icon) => {
  switch (icon) {
    case 'account_balance':
      return <AccountBalanceIcon />;
    case 'credit_card':
      return <CreditCardIcon />;
    case 'attach_money':
      return <AttachMoneyIcon />;
    case 'museum':
      return <MuseumIcon />;
    default:
      return <SubtitlesIcon />;
  }
});

export const buildAccountColor = memoize((color) => {
  switch (color) {
    case 'red':
      return 'danger';
    case 'blue':
      return 'info';
    case 'green':
      return 'success';
    default:
      return 'success';
  }
});

export const buildTallyInfo = memoize((tallyBalance, tallyDt) => {
  const tallyAmt = formatAmt(tallyBalance, true);
  const tallyDate = moment(tallyDt, format.YYYYMMDDHHmmss).format(format.DDMMMYYYYHHMM);
  return tallyAmt + ' @ ' + tallyDate;
});

export const buildBillInfo = memoize((billed, lastBill, openBill) => {
  if (!billed) {
    return 'No bills.';
  }
  if (lastBill && lastBill.balance > 0) {
    const dueAmt = formatAmt(lastBill.balance, true);
    const dueDt = formatDate(lastBill.dueDt, format.DDMMM);
    return dueAmt + ' (Due on ' + dueDt + ')';
  }
  if (openBill) {
    const billDt = formatDate(openBill.billDt, format.DDMMM);
    return 'Next bill on ' + billDt;
  }
});

export const buildAccountTallyInfoColor = memoize((tallyDt) => {
  const sameDay = moment(tallyDt, format.YYYYMMDDHHmmss).isSame(moment(), 'day');
  return sameDay ? 'success' : 'warning';
});

export const buildAccountBillInfoColor = memoize((billed, lastBill, openBill) => {
  if (!billed) {
    return 'warning';
  }
  if (lastBill && lastBill.balance > 0) {
    return 'rose';
  }
  if (openBill) {
    return 'info';
  }
});

export const findBill = memoize((bills, account, path) => {
  const id = _.get(account, path);
  if (!(account.billed && id)) {
    return null;
  }
  return _.find(bills, { id: id });
});

export const sliceAccounts = memoize((accounts, expanded) => {
  return expanded ? accounts : _.slice(accounts, 0, COUNTS.DASHBOARD_ACCOUNTS);
});
