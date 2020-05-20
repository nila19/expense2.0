'use strict';

import { Router } from 'express';

import { closeBill, payBill } from 'controllers/bill-controller';
import { inject404 } from 'routes/error-route';

const router = Router();

router.use(function (req, res, next) {
  res.locals.authenticated = true;
  next();
});

router.all('*', function (req, res, next) {
  next();
});

router.post('/closeBill', function (req, res) {
  closeBill(req, res);
});

router.post('/payBill', function (req, res) {
  payBill(req, res);
});

router.use(inject404());

export { router };
