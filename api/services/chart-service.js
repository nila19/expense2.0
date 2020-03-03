'use strict';

import Promise from 'bluebird';

import { transactions } from '../models';

import { buildSummary } from './summary-service';
import { logErr } from '../utils/common-utils';
import { buildMonthsList } from '../utils/month-utils';

export const buildChart = parms => {
  return new Promise((resolve, reject) => {
    let _months = null;
    let regular = null;
    let adhoc = null;
    transactions
      .findAllTransMonths(parms.db, parms.cityId)
      .then(data => buildMonthsList(data, parms.log))
      .then(month => {
        _months = month;
        parms.regular = true;
        parms.adhoc = false;
        return buildSummary(parms);
      })
      .then(grid => {
        regular = grid[0];
        parms.regular = false;
        parms.adhoc = true;
        return buildSummary(parms);
      })
      .then(grid => {
        adhoc = grid[0];
        return buildGrid(_months, regular, adhoc);
      })
      .then(chart => resolve(chart))
      .catch(err => {
        logErr(parms.log, err);
        return reject(err);
      });
  });
};

const buildGrid = (months, regular, adhoc) => {
  return new Promise(resolve => {
    const chart = { labels: [], regulars: [], adhocs: [], totals: [] };
    months.forEach((m, i) => {
      if (!m.aggregate) {
        chart.labels.push(m.name);
        chart.regulars.push(regular.amount[i]);
        chart.adhocs.push(adhoc.amount[i]);
        chart.totals.push(regular.amount[i] + adhoc.amount[i]);
      }
    });
    return resolve(chart);
  });
};
