'use strict';

import _ from 'lodash';

import { buildSummary } from '../services/summary-service';
import { buildChart } from '../services/chart-service';

export const doSummary = async (req, resp) => {
  const parms = {
    db: req.app.locals.db,
    log: req.app.locals.log,
    cityId: _.toNumber(req.query.cityId),
    regular: req.query.regular && req.query.regular == 'true',
    adhoc: req.query.adhoc && req.query.adhoc == 'true',
    forecast: req.query.forecast && req.query.forecast == 'true'
  };
  const data = await buildSummary(parms);
  return resp.json({ code: 0, data: data });
};

export const doChart = async (req, resp) => {
  const parms = {
    db: req.app.locals.db,
    log: req.app.locals.log,
    cityId: _.toNumber(req.query.cityId),
    forecast: false
  };
  const data = await buildChart(parms);
  return resp.json({ code: 0, data: data });
};
