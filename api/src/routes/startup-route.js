'use strict';

import { Router } from 'express';

import { inject404 } from 'routes/error-route';
import {
  doConnect,
  getAllCities,
  getDefaultCity,
  getAccounts,
  getCategories,
  getDescriptions,
  getEntryMonths,
  getTransMonths,
  getBills,
} from 'controllers/startup-controller';

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
  getAllCities(req, res);
});

router.get('/city/default', (req, res) => {
  getDefaultCity(req, res);
});

router.post('/categories', (req, res) => {
  getCategories(req, res);
});

router.post('/descriptions', (req, res) => {
  getDescriptions(req, res);
});

router.post('/months/entry', (req, res) => {
  getEntryMonths(req, res);
});

router.post('/months/trans', (req, res) => {
  getTransMonths(req, res);
});

router.post('/accounts', (req, res) => {
  getAccounts(req, res);
});

router.post('/bills', (req, res) => {
  getBills(req, res);
});

router.use(inject404());

export { router };
