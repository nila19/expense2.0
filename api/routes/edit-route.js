'use strict';

import _ from 'lodash';
import { Router } from 'express';

import { inject404 } from './error-route';
import {
  tallyAccount,
  addExpense,
  modifyExpense,
  deleteExpense,
  swapExpenses,
  payBill,
} from '../controllers/edit-controller';

const router = Router();

router.use(function (req, res, next) {
  res.locals.authenticated = true;
  next();
});

router.all('*', function (req, res, next) {
  next();
});

router.post('/tally/:acctId', function (req, res) {
  tallyAccount(req, res, _.toNumber(req.params.acctId));
});

router.post('/add', function (req, res) {
  addExpense(req, res);
});

router.post('/modify', function (req, res) {
  modifyExpense(req, res);
});

router.post('/delete/:transId', function (req, res) {
  deleteExpense(req, res, _.toNumber(req.params.transId));
});

router.post('/swap/:cityId', function (req, res) {
  swapExpenses(req, res, _.toNumber(req.params.cityId));
});

router.post('/payBill', function (req, res) {
  payBill(req, res);
});

router.use(inject404());

export default router;
