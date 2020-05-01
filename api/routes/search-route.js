'use strict';

import { Router } from 'express';

import { inject404 } from './error-route';
import { doSearch } from '../controllers/search-controller';

const router = Router();

router.use((req, res, next) => {
  res.locals.authenticated = true;
  next();
});

router.all('*', (req, res, next) => {
  next();
});

router.post('/go', (req, res) => {
  doSearch(req, res);
});

router.use(inject404());

export default router;
