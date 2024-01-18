import _ from "lodash";
import moment from "moment";
import memoize from "memoize-one";

import { COUNTS } from "app/config";
import { FORMATS } from "app/constants";

import { formatAmt, formatDate } from "features/utils";

export const buildAccountColor = memoize((color) => {
  switch (color) {
    case "red":
      return "error";
    case "blue":
      return "info";
    case "green":
      return "success";
    case "purple":
      return "primary";
    default:
      return "primary";
  }
});

export const buildTallyInfo = memoize((tallyBalance, tallyDt) => {
  const tallyAmt = formatAmt(tallyBalance, true);
  const tallyDate = moment(tallyDt, FORMATS.YYYYMMDDHHmmss).format(FORMATS.DDMMMYYYYHHMM);
  return tallyAmt + " @ " + tallyDate;
});

export const buildBillInfo = memoize((billed, lastBill, openBill) => {
  if (!billed) {
    return "No bills.";
  }
  if (lastBill && lastBill.balance > 0) {
    const dueAmt = formatAmt(lastBill.balance, true);
    const dueDt = formatDate(lastBill.dueDt, FORMATS.DDMMM);
    return dueAmt + " (Due on " + dueDt + ")";
  }
  if (openBill) {
    const billDt = formatDate(openBill.billDt, FORMATS.DDMMM);
    return "Next bill on " + billDt;
  }
});

export const buildAccountTallyInfoColor = memoize((tallyDt) => {
  const sameDay = moment(tallyDt, FORMATS.YYYYMMDDHHmmss).isSame(moment(), "day");
  return sameDay ? "success" : "warning";
});

export const buildAccountBillInfoColor = memoize((billed, lastBill, openBill) => {
  if (!billed) {
    return "warning";
  }
  if (lastBill && lastBill.balance > 0) {
    return "primary";
  }
  if (openBill) {
    return "info";
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
