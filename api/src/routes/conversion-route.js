'use strict';

import { Router } from 'express';

import { convertDescAndMonths, addYears, convertSummary } from 'controllers/conversion-controller';
import { inject404 } from 'routes/error-route';

const router = Router();

router.use((req, res, next) => {
  res.locals.authenticated = true;
  next();
});

router.all('*', (req, res, next) => {
  next();
});

router.post('/convertDescAndMonths', (req, res) => {
  convertDescAndMonths(req, res);
});

router.post('/addYears', (req, res) => {
  addYears(req, res);
});

router.post('/convertSummary', (req, res) => {
  convertSummary(req, res);
});

router.use(inject404());

export { router };
