'use strict';

import numeral from 'numeral';
import { Router } from 'express';

import { inject404 } from './error-route';
import { getTransactionById, getBills, getBillById, getAccountById } from '../controllers/dashboard-controller';

const router = Router();

router.use((req, res, next) => {
  res.locals.authenticated = true;
  next();
});

router.all('*', (req, res, next) => {
  next();
});

router.get('/transaction/:transId', (req, res) => {
  getTransactionById(req, res, numeral(req.params.transId).value());
});

router.get('/bills', (req, res) => {
  getBills(req, res);
});

router.get('/bill/:billId', (req, res) => {
  getBillById(req, res, numeral(req.params.billId).value());
});

router.get('/account/:acctId', (req, res) => {
  getAccountById(req, res, numeral(req.params.acctId).value());
});

router.use(inject404());

export default router;
