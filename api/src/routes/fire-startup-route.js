'use strict';

import { Router } from 'express';

import { inject404 } from 'routes/error-route';
import {
  doConnect,
  getAllFireCities,
  getCapitalFireCities,
  getPopulatedCapitalFireCities,
  getCAFireCities,
  getMuseumLandmarks,
} from 'controllers/fire-startup-controller';

const router = Router();

router.use((req, res, next) => {
  res.locals.authenticated = true;
  next();
});

router.all('*', (req, res, next) => {
  next();
});

router.get('/connect', (req, res) => {
  doConnect(req, res);
});

router.get('/cities', (req, res) => {
  getAllFireCities(req, res);
});

router.get('/capital-cities', (req, res) => {
  getCapitalFireCities(req, res);
});

router.get('/populated-capital-cities', (req, res) => {
  getPopulatedCapitalFireCities(req, res);
});

router.get('/ca-cities', (req, res) => {
  getCAFireCities(req, res);
});

router.get('/museum-landmarks', (req, res) => {
  getMuseumLandmarks(req, res);
});

router.use(inject404());

export { router };
