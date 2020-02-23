'use strict';

const _ = require('lodash');
const summaryService = require('../services/SummaryService');
const chartService = require('../services/ChartService');
const config = require('../config/config');

const doSummary = function (req, resp) {
  const parms = {
    db: req.app.locals.db,
    log: req.app.locals.log,
    cityId: _.toNumber(req.query.cityId),
    regular: req.query.regular && req.query.regular == 'true',
    adhoc: req.query.adhoc && req.query.adhoc == 'true',
    forecast: req.query.forecast && req.query.forecast == 'true'
  };

  summaryService.buildSummary(parms).then((grid) => {
    return resp.json({code: 0, data: grid});
  }).catch((err) => {
    return resp.json({code: config.error, msg: err});
  });
};

const doChart = function (req, resp) {
  const parms = {
    db: req.app.locals.db,
    log: req.app.locals.log,
    cityId: _.toNumber(req.query.cityId),
    forecast: false
  };

  chartService.buildChart(parms).then((chart) => {
    return resp.json({code: 0, data: chart});
  }).catch((err) => {
    return resp.json({code: config.error, msg: err});
  });
};

module.exports = {
  doSummary: doSummary,
  doChart: doChart
};
