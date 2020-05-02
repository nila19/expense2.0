import React from 'react';

import moment from 'moment';
import numeral from 'numeral';

// @material-ui/icons
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import MuseumIcon from '@material-ui/icons/Museum';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import SubtitlesIcon from '@material-ui/icons/Subtitles';

import { format } from 'features/utils';

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
  const tallyAmt = numeral(account.balance).format(format.AMOUNT_SYMBOL);
  const tallyDate = moment(account.tallyDt, format.YYYYMMDDHHmmss).format(format.DDMMMYYYYHHMM);
  return tallyAmt + ' @ ' + tallyDate;
};

export const buildBillInfo = (account) => {
  if (!account.billed) {
    return 'No bills.';
  }
  if (account.bills.last && account.bills.last.balance > 0) {
    const dueAmt = numeral(account.bills.last.balance).format(format.AMOUNT_SYMBOL);
    const dueDate = moment(account.bills.last.dueDt, format.YYYYMMDD).format(format.DDMMM);
    return dueAmt + ' ( Due on ' + dueDate + ')';
  }
  if (account.bills.open) {
    const billDate = moment(account.bills.open.billDt, format.YYYYMMDD).format(format.DDMMM);
    return 'Next bill on ' + billDate;
  }
};

export const buildAccountTallyInfoColor = (account) => {
  const sameDay = moment(account.tallyDt, format.YYYYMMDDHHmmss).isSame(moment(), 'day');
  return sameDay ? 'success' : 'warning';
};

export const buildAccountBillInfoColor = (account) => {
  if (!account.billed) {
    return 'warning';
  }
  if (account.bills.last && account.bills.last.balance > 0) {
    return 'rose';
  }
  if (account.bills.open) {
    return 'info';
  }
};
