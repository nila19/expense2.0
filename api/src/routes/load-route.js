'use strict';

import _ from 'lodash';
import { Router } from 'express';

import { inject404 } from 'routes/error-route';
import { loadCities, loadLandmarks } from 'controllers/load-controller';

const router = Router();

router.use(function (req, res, next) {
  res.locals.authenticated = true;
  next();
});

router.all('*', function (req, res, next) {
  next();
});

router.post('/cities', function (req, res) {
  loadCities(req, res);
});

router.post('/landmarks', function (req, res) {
  loadLandmarks(req, res);
});
router.use(inject404());

export { router };
