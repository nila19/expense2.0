'use strict';

import { Router } from 'express';

import { addExpense, modifyExpense, deleteExpense, swapExpenses } from 'controllers/expense-controller';
import { inject404 } from 'routes/error-route';

const router = Router();

router.use(function (req, res, next) {
  res.locals.authenticated = true;
  next();
});

router.all('*', function (req, res, next) {
  next();
});

router.post('/add', function (req, res) {
  addExpense(req, res);
});

router.post('/modify', function (req, res) {
  modifyExpense(req, res);
});

router.post('/delete', function (req, res) {
  deleteExpense(req, res);
});

router.post('/swap', function (req, res) {
  swapExpenses(req, res);
});

router.use(inject404());

export { router };
