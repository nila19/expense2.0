'use strict';

import _ from 'lodash';

import {
  convertDescAndMonths as _convertDescAndMonths,
  addYears as _addYears,
  convertSummary as _convertSummary,
} from 'services/conversion/conversion-service';

export const convertDescAndMonths = async (req, resp) => {
  await _convertDescAndMonths(req.app.locals.db);
  return resp.json({ code: 0 });
};

export const addYears = async (req, resp) => {
  await _addYears(req.app.locals.db);
  return resp.json({ code: 0 });
};

export const convertSummary = async (req, resp) => {
  await _convertSummary(req.app.locals.db);
  return resp.json({ code: 0 });
};
