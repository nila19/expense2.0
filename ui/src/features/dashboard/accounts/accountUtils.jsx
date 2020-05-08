import React from 'react';

import moment from 'moment';

// @material-ui/icons
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import MuseumIcon from '@material-ui/icons/Museum';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import SubtitlesIcon from '@material-ui/icons/Subtitles';

import { format, formatAmt, formatDate } from 'features/utils';

export const buildAccountIcon = (icon) => {
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
};

export const buildAccountColor = (color) => {
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
};

export const buildTallyInfo = (account) => {
  const tallyAmt = formatAmt(account.tallyBalance, true);
  const tallyDate = moment(account.tallyDt, format.YYYYMMDDHHmmss).format(format.DDMMMYYYYHHMM);
  return tallyAmt + ' @ ' + tallyDate;
};

export const buildBillInfo = (account, lastBill, openBill) => {
  if (!account.billed) {
    return 'No bills.';
  }
  if (lastBill && lastBill.balance > 0) {
    const dueAmt = formatAmt(lastBill.balance, true);
    const dueDate = formatDate(lastBill.dueDt, format.DDMMM);
    return dueAmt + ' (Due on ' + dueDate + ')';
  }
  if (openBill) {
    const billDate = formatDate(lastBill.dueDt, format.DDMMM);
    return 'Next bill on ' + billDate;
  }
};

export const buildAccountTallyInfoColor = (account) => {
  const sameDay = moment(account.tallyDt, format.YYYYMMDDHHmmss).isSame(moment(), 'day');
  return sameDay ? 'success' : 'warning';
};

export const buildAccountBillInfoColor = (account, lastBill, openBill) => {
  if (!account.billed) {
    return 'warning';
  }
  if (lastBill && lastBill.balance > 0) {
    return 'rose';
  }
  if (openBill) {
    return 'info';
  }
};
