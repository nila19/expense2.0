'use strict';

import { Router } from 'express';

import { loadCities, loadLandmarks } from 'controllers/fire-load-controller';
import { inject404 } from 'routes/error-route';

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
