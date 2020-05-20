'use strict';

import { Router } from 'express';

import { doSummary, doChart } from 'controllers/summary-controller';
import { inject404 } from 'routes/error-route';

const router = Router();

router.use((req, res, next) => {
  res.locals.authenticated = true;
  next();
});

router.all('*', (req, res, next) => {
  next();
});

router.post('/summary', (req, res) => {
  doSummary(req, res);
});

router.post('/chart', (req, res) => {
  doChart(req, res);
});

router.use(inject404());

export { router };
