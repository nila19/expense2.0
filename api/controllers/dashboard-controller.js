'use strict';

import _ from 'lodash';

import { accounts, bills, transactions } from '../models';

import { sendJson } from '../utils/common-utils';

// TODO: move the db logic to service
export const getTransactionById = (req, resp, transId) => {
  const promise = transactions.findById(req.app.locals.db, transId);
  return sendJson(promise, resp, req.app.locals.log);
};

export const getBills = (req, resp) => {
  const p = {
    db: req.app.locals.db,
    id: req.query.acctId ? _.toNumber(req.query.acctId) : _.toNumber(req.query.cityId),
    paid: req.query.paidInd
  };
  const promise = req.query.acctId ? bills.findForAcct(p.db, p.id, p.paid) : bills.findForCity(p.db, p.id, p.paid);
  return sendJson(promise, resp, req.app.locals.log);
};

export const getBillById = (req, resp, billId) => {
  const promise = bills.findById(req.app.locals.db, billId);
  return sendJson(promise, resp, req.app.locals.log);
};

export const getAccountById = (req, resp, acctId) => {
  const promise = accounts.findById(req.app.locals.db, acctId);
  return sendJson(promise, resp, req.app.locals.log);
};
