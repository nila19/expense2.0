'use strict';

import { Router } from 'express';

import { inject404 } from 'routes/error-route';
import { doSummary, doChart } from 'controllers/summary-controller';

const router = Router();

router.use((req, res, next) => {
  res.locals.authenticated = true;
  next();
});

router.all('*', (req, res, next) => {
  next();
});

router.get('/go', (req, res) => {
  doSummary(req, res);
});

router.get('/chart', (req, res) => {
  doChart(req, res);
});

router.use(inject404());

export { router };
