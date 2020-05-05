'use strict';

import _ from 'lodash';

import { accountModel, billModel, transactionModel } from 'models';

export const getTransactionById = async (req, resp, transId) => {
  const data = await transactionModel.findById(req.app.locals.db, transId);
  return resp.json({ code: 0, data: data });
};

export const getBills = async (req, resp) => {
  const parms = {
    db: req.app.locals.db,
    id: req.query.acctId ? _.toNumber(req.query.acctId) : _.toNumber(req.query.cityId),
    paid: req.query.paidInd,
  };
  const data = req.query.acctId
    ? await billModel.findForAcct(parms.db, parms.id, parms.paid)
    : await billModel.findForCity(parms.db, parms.id, parms.paid);
  return resp.json({ code: 0, data: data });
};

export const getBillById = async (req, resp, billId) => {
  const data = await billModel.findById(req.app.locals.db, billId);
  return resp.json({ code: 0, data: data });
};

export const getAccountById = async (req, resp, acctId) => {
  const data = await accountModel.findById(req.app.locals.db, acctId);
  return resp.json({ code: 0, data: data });
};
