'use strict';

import { tally } from '../services/tally-service';
import { addExpense as _addExpense } from '../services/add-service';
import { deleteExpense as _deleteExpense } from '../services/delete-service';
import { modifyExpense as _modifyExpense } from '../services/modify-service';
import { payBill as _payBill } from '../services/bill-pay-service';
import { swapExpenses as _swapExpenses } from '../services/swap-service';
import { buildParm } from '../utils/common-utils';
import { error } from '../config/config';

export const tallyAccount = (req, resp, acctId) => {
  const parms = buildParm(req);
  parms.acctId = acctId;
  tally(parms, err => {
    return err ? resp.json({ code: error, msg: err.message }) : resp.json({ code: 0 });
  });
};

export const addExpense = (req, resp) => {
  _addExpense(buildParm(req), req.body, (err, trans) => {
    return err ? resp.json({ code: error, msg: err.message }) : resp.json({ code: 0, data: trans });
  });
};

export const modifyExpense = (req, resp) => {
  _modifyExpense(buildParm(req), req.body, err => {
    return err ? resp.json({ code: error, msg: err.message }) : resp.json({ code: 0 });
  });
};

export const deleteExpense = (req, resp, transId) => {
  const parms = buildParm(req);
  parms.transId = transId;
  _deleteExpense(parms, err => {
    return err ? resp.json({ code: error, msg: err.message }) : resp.json({ code: 0 });
  });
};

export const swapExpenses = (req, resp) => {
  _swapExpenses(buildParm(req), req.body, err => {
    return err ? resp.json({ code: error, msg: err.message }) : resp.json({ code: 0 });
  });
};

export const payBill = (req, resp) => {
  _payBill(buildParm(req), req.body, (err, trans) => {
    return err ? resp.json({ code: error, msg: err.message }) : resp.json({ code: 0, data: trans });
  });
};
