'use strict';

import _ from 'lodash';
import { Router } from 'express';

import { inject404 } from './error-route';
import {
  canConnect,
  getAllCities,
  getDefaultCity,
  getCityById,
  getAccounts,
  getAccountsThin,
  getCategories,
  getDescriptions,
  getEntryMonths,
  getTransMonths
} from '../controllers/startup-controller';

const router = Router();

router.use((req, res, next) => {
  res.locals.authenticated = true;
  next();
});

router.all('*', (req, res, next) => {
  next();
});

router.get('/connect', (req, res) => {
  canConnect(req, res);
});

router.get('/cities', (req, res) => {
  getAllCities(req, res);
});

router.get('/city/default', (req, res) => {
  getDefaultCity(req, res);
});

router.get('/city/:cityId', (req, res) => {
  getCityById(req, res, _.toNumber(req.params.cityId));
});

router.get('/accounts', (req, res) => {
  getAccounts(req, res);
});

router.get('/accounts/thin', (req, res) => {
  getAccountsThin(req, res);
});

router.get('/categories', (req, res) => {
  getCategories(req, res);
});

router.get('/descriptions', (req, res) => {
  getDescriptions(req, res);
});

router.get('/months/entry', (req, res) => {
  getEntryMonths(req, res);
});

router.get('/months/trans', (req, res) => {
  getTransMonths(req, res);
});

router.use(inject404());

export default router;
