'use strict';

import _ from 'lodash';

import { tallyAccount as _tallyAccount } from '../services/tally-service';
import { addExpense as _addExpense } from '../services/add-service';
import { deleteExpense as _deleteExpense } from '../services/delete-service';
import { modifyExpense as _modifyExpense } from '../services/modify-service';
import { closeBill as _closeBill } from '../services/bill-service';
import { payBill as _payBill } from '../services/bill-pay-service';
import { swapExpenses as _swapExpenses } from '../services/swap-service';

export const tallyAccount = async (req, resp) => {
  const parms = buildParm(req);
  const acctId = _.toNumber(req.body.id);
  try {
    await _tallyAccount(parms, acctId);
    return resp.json({ code: 0 });
  } catch (error) {
    console.log(error);
    return resp.status(500).send(error.message);
  }
};

export const addExpense = async (req, resp) => {
  const parms = buildParm(req);
  try {
    const trans = await _addExpense(parms, req.body);
    return resp.json({ code: 0, data: trans });
  } catch (error) {
    console.log(error);
    return resp.status(500).send(error.message);
  }
};

export const modifyExpense = async (req, resp) => {
  const parms = buildParm(req);
  try {
    await _modifyExpense(parms, req.body);
    return resp.json({ code: 0 });
  } catch (error) {
    console.log(error);
    return resp.status(500).send(error.message);
  }
};

export const deleteExpense = async (req, resp) => {
  const parms = buildParm(req);
  const transId = _.toNumber(req.body.id);
  try {
    await _deleteExpense({ ...parms, transId: transId });
    return resp.json({ code: 0 });
  } catch (error) {
    console.log(error);
    return resp.status(500).send(error.message);
  }
};

export const swapExpenses = async (req, resp) => {
  const parms = buildParm(req);
  try {
    await _swapExpenses(parms, req.body);
    return resp.json({ code: 0 });
  } catch (error) {
    console.log(error);
    return resp.status(500).send(error.message);
  }
};

export const payBill = async (req, resp) => {
  const parms = buildParm(req);
  try {
    const trans = await _payBill(parms, req.body);
    return resp.json({ code: 0, data: trans });
  } catch (error) {
    console.log(error);
    return resp.status(500).send(error.message);
  }
};

export const closeBill = async (req, resp) => {
  const parms = buildParm(req);
  try {
    await _closeBill(parms, req.body);
    return resp.json({ code: 0 });
  } catch (error) {
    console.log(error);
    return resp.status(500).send(error.message);
  }
};

// utility method
const buildParm = (req) => {
  return {
    db: req.app.locals.db,
    log: req.app.locals.log,
  };
};
