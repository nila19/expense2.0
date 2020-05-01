'use strict';

import _ from 'lodash';

import { tallyAccount as _tallyAccount } from '../services/tally-service';
import { addExpense as _addExpense } from '../services/add-service';
import { deleteExpense as _deleteExpense } from '../services/delete-service';
import { modifyExpense as _modifyExpense } from '../services/modify-service';
import { payBill as _payBill } from '../services/bill-pay-service';
import { swapExpenses as _swapExpenses } from '../services/swap-service';

export const tallyAccount = async (req, resp) => {
  const parms = buildParm(req);
  const acctId = _.toNumber(req.body.id);
  await _tallyAccount(parms, acctId);
  return resp.json({ code: 0 });
};

export const addExpense = async (req, resp) => {
  const parms = buildParm(req);
  const trans = await _addExpense(parms, req.body);
  return resp.json({ code: 0, data: trans });
};

export const modifyExpense = async (req, resp) => {
  const parms = buildParm(req);
  await _modifyExpense(parms, req.body);
  return resp.json({ code: 0 });
};

export const deleteExpense = async (req, resp) => {
  const parms = buildParm(req);
  const transId = _.toNumber(req.body.id);
  await _deleteExpense({ ...parms, transId: transId });
  return resp.json({ code: 0 });
};

export const swapExpenses = async (req, resp) => {
  const parms = buildParm(req);
  await _swapExpenses(parms, req.body);
  return resp.json({ code: 0 });
};

export const payBill = async (req, resp) => {
  const parms = buildParm(req);
  const trans = await _payBill(parms, req.body);
  return resp.json({ code: 0, data: trans });
};

// utility method
const buildParm = (req) => {
  return {
    db: req.app.locals.db,
    log: req.app.locals.log,
  };
};
