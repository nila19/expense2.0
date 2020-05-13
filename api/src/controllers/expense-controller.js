'use strict';

import _ from 'lodash';

import { addExpense as _addExpense } from 'services/expense/add-service';
import { deleteExpense as _deleteExpense } from 'services/expense/delete-service';
import { modifyExpense as _modifyExpense } from 'services/expense/modify-service';
import { swapExpenses as _swapExpenses } from 'services/expense/swap-service';

export const addExpense = async (req, resp) => {
  const parms = buildParm(req);
  try {
    const trans = await _addExpense(parms, req.body);
    return resp.json({ code: 0, data: trans });
  } catch (error) {
    parms.log.error(error);
    return resp.status(500).send(error.message);
  }
};

export const modifyExpense = async (req, resp) => {
  const parms = buildParm(req);
  try {
    await _modifyExpense(parms, req.body);
    return resp.json({ code: 0 });
  } catch (error) {
    parms.log.error(error);
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
    parms.log.error(error);
    return resp.status(500).send(error.message);
  }
};

export const swapExpenses = async (req, resp) => {
  const parms = buildParm(req);
  try {
    await _swapExpenses(parms, req.body);
    return resp.json({ code: 0 });
  } catch (error) {
    parms.log.error(error);
    return resp.status(500).send(error.message);
  }
};

const buildParm = (req) => {
  return {
    db: req.app.locals.db,
    log: req.app.locals.log,
  };
};
