'use strict';

const Promise = require('bluebird');
const transactions = require('../models/Transactions')();
const summary = require('./SummaryService');
const cu = require('../utils/common-utils');
const monthUtils = require('../utils/month-utils');

const buildChart = function (parms) {
  return new Promise(function (resolve, reject) {
    let months = null;
    let regular = null;
    let adhoc = null;

    transactions.findAllTransMonths(parms.db, parms.cityId).then((data) => {
      return monthUtils.buildMonthsList(data, parms.log);
    }).then((m) => {
      months = m;
      parms.regular = true;
      parms.adhoc = false;
      return summary.buildSummary(parms);
    }).then((grid) => {
      regular = grid[0];
      parms.regular = false;
      parms.adhoc = true;
      return summary.buildSummary(parms);
    }).then((grid) => {
      adhoc = grid[0];
      return buildGrid(months, regular, adhoc);
    }).then((chart) => {
      return resolve(chart);
    }).catch((err) => {
      cu.logErr(parms.log, err);
      return reject(err);
    });
  });
};

const buildGrid = function (months, regular, adhoc) {
  return new Promise(function (resolve) {
    const chart = {labels: [], regulars: [], adhocs: [], totals: []};

    months.forEach(function (m, i) {
      if(!m.aggregate) {
        chart.labels.push(m.name);
        chart.regulars.push(regular.amount[i]);
        chart.adhocs.push(adhoc.amount[i]);
        chart.totals.push(regular.amount[i] + adhoc.amount[i]);
      }
    });
    return resolve(chart);
  });
};

module.exports = {
  buildChart: buildChart,
};
