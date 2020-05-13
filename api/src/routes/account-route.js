'use strict';

import _ from 'lodash';
import { Router } from 'express';

import { inject404 } from 'routes/error-route';
import { tallyAccount } from 'controllers/account-controller';

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
