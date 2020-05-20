'use strict';

import { Router } from 'express';

import { tallyAccount } from 'controllers/account-controller';
import { inject404 } from 'routes/error-route';

const router = Router();

router.use(function (req, res, next) {
  res.locals.authenticated = true;
  next();
});

router.all('*', function (req, res, next) {
  next();
});

router.post('/tally', function (req, res) {
  tallyAccount(req, res);
});

router.use(inject404());

export { router };
