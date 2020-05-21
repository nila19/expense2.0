'use strict';

import { Router } from 'express';

import { doSearch } from 'controllers/search-controller';
import { inject404 } from 'routes/error-route';

const router = Router();

router.use((req, res, next) => {
  res.locals.authenticated = true;
  next();
});

router.all('*', (req, res, next) => {
  next();
});

router.post('/search', (req, res) => {
  doSearch(req, res);
});

router.use(inject404());

export { router };
