'use strict';

const express = require('express');
const router = express.Router();
const error = require('./error-route');
const search = require('../controllers/SearchController');

router.use(function (req, res, next) {
  res.locals.authenticated = true;
  next();
});

router.all('*', function (req, res, next) {
  next();
});

router.get('/go', function (req, res, next) {
  search.doSearch(req, res);
});

router.use(error.inject404());

module.exports = router;
