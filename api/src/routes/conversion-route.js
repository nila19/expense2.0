'use strict';

import _ from 'lodash';
import { Router } from 'express';

import { inject404 } from 'routes/error-route';
import { convert } from 'controllers/conversion-controller';

const router = Router();

router.use((req, res, next) => {
  res.locals.authenticated = true;
  next();
});

router.all('*', (req, res, next) => {
  next();
});

router.post('/convert', (req, res) => {
  convert(req, res);
});

router.use(inject404());

export { router };
