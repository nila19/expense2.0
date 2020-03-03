'use strict';

import _ from 'lodash';

import { buildSummary } from '../services/summary-service';
import { buildChart } from '../services/chart-service';
import config from '../config/config';

export const doSummary = (req, resp) => {
  const parms = {
    db: req.app.locals.db,
    log: req.app.locals.log,
    cityId: _.toNumber(req.query.cityId),
    regular: req.query.regular && req.query.regular == 'true',
    adhoc: req.query.adhoc && req.query.adhoc == 'true',
    forecast: req.query.forecast && req.query.forecast == 'true'
  };
  buildSummary(parms)
    .then(grid => {
      return resp.json({ code: 0, data: grid });
    })
    .catch(err => {
      return resp.json({ code: config.error, msg: err });
    });
};

export const doChart = (req, resp) => {
  const parms = {
    db: req.app.locals.db,
    log: req.app.locals.log,
    cityId: _.toNumber(req.query.cityId),
    forecast: false
  };
  buildChart(parms)
    .then(chart => {
      return resp.json({ code: 0, data: chart });
    })
    .catch(err => {
      return resp.json({ code: config.error, msg: err });
    });
};
