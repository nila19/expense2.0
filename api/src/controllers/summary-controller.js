'use strict';

import _ from 'lodash';

import { buildSummary } from 'services/summary-service';
import { buildChart } from 'services/chart-service';

export const doSummary = async (req, resp) => {
  const { cityId, regular, adhoc, forecast } = req.body;
  const parms = {
    db: req.app.locals.db,
    log: req.app.locals.log,
  };
  const data = await buildSummary({ ...parms, cityId, regular, adhoc, forecast });
  return resp.json({ code: 0, data: data });
};

export const doChart = async (req, resp) => {
  const parms = {
    db: req.app.locals.db,
    log: req.app.locals.log,
    cityId: req.body.cityId,
    forecast: false,
  };
  const data = await buildChart(parms);
  return resp.json({ code: 0, data: data });
};
