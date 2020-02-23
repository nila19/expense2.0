'use strict';

const Promise = require('bluebird');
const moment = require('moment');
const _ = require('lodash');
const fmt = require('../config/formats');
const categories = require('../models/Categories')();
const transactions = require('../models/Transactions')();
const mu = require('../utils/month-utils');
const cu = require('../utils/common-utils');

const buildSummary = function (parms) {
  return new Promise(function (resolve, reject) {
    let data = null;

    getDataFromDB(parms).then((data1) => {
      data = data1;
      return buildEmptyGrid(data);
    }).then((grid) => {
      return populateGrid(data, grid);
    }).then((grid) => {
      return calcYearlySummary(data, grid);
    }).then((grid) => {
      return buildForecastGrid(parms, data, grid);
    }).then((grid) => {
      return weedInactiveCats(grid);
    }).then((grid) => {
      return sortGridByCategory(data, grid);
    }).then((gridArr) => {
      return calcTotalRow(data, gridArr);
    }).then((gridArr) => {
      return resolve(gridArr);
    }).catch((err) => {
      cu.logErr(parms.log, err);
      return reject(err);
    });
  });
};

// step - 0 : initial method to fetch all data from DB..
const getDataFromDB = function (parms) {
  return new Promise(function (resolve, reject) {
    const data = {};

    categories.findForCity(parms.db, parms.cityId).then((cats) => {
      data.cats = cats;
      return transactions.findAllTransMonths(parms.db, parms.cityId);
    }).then((months) => {
      return mu.buildMonthsList(months, parms.log);
    }).then((months) => {
      data.months = months;
      return transactions.findForMonthlySummary(parms.db, parms.cityId, parms.regular, parms.adhoc);
    }).then((trans) => {
      data.trans = trans;
      return transactions.findForForecast(parms.db, parms.cityId);
    }).then((trans) => {
      data.fctrans = trans;
      resolve(data);
    }).catch((err) => {
      reject(err);
    });
  });
};

// setp 1: build empty grid with 1 row for  each category.
const buildEmptyGrid = function (data) {
  return new Promise(function (resolve) {
    const grid = {};
    const len = data.months.length;

    data.cats.forEach(function (cat) {
      grid[cat.id] = {category: cat, amount: _.fill(Array(len), 0), count: _.fill(Array(len), 0)};
    });
    return resolve(grid);
  });
};

// setp 2: populate the grid with transaction data.
const populateGrid = function (data, grid) {
  return new Promise(function (resolve) {
    data.trans.forEach(function (tr) {
      const ui = grid[tr.category.id];
      const mth = _.split(tr.transMonth, '-');
      const idx = _.findIndex(data.months, ['seq', _.toNumber(mth[0] + mth[1])]);

      ui.amount[idx] += tr.amount;
      ui.count[idx] += 1;
    });
    return resolve(grid);
  });
};

// setp 3: populate the yearly summary columns with totals from the months of the year.
// yearly Summary - For each SummaryUI, populate the yearly totals by summing up the months for that year.
// pick only the non-aggregate months for totaling.
const calcYearlySummary = function (data, grid) {
  return new Promise(function (resolve) {
    data.months.forEach(function (year, ii) {
      if(year.aggregate) {
        data.months.forEach(function (month, jj) {
          if(!month.aggregate && year.year === month.year) {
            _.forIn(grid, function (ui) {
              ui.amount[ii] += ui.amount[jj];
              ui.count[ii] += ui.count[jj];
            });
          }
        });
      }
    });
    return resolve(grid);
  });
};

// setp 4: build forecast grid, if the forecast flag is on. if the flag is not on, proceed forward.
const buildForecastGrid = function (parms, data, grid) {
  return new Promise(function (resolve, reject) {
    if(!parms.forecast) {
      return resolve(grid);
    }
    buildEmptyGrid(data).then((fcgrid) => {
      return populateFcGrid(data, fcgrid);
    }).then((fcgrid) => {
      return embedFcToGrid(data, grid, fcgrid);
    }).then((grid) => {
      return resolve(grid);
    }).catch((err) => {
      return reject(err);
    });
  });
};

// setp 4.1: populate the forecast grid with fctransaction data.
const populateFcGrid = function (data, fcgrid) {
  return new Promise(function (resolve) {
    data.fctrans.forEach(function (tr) {
      const ui = fcgrid[tr.category.id];

      ui.amount[0] += tr.amount;
      ui.count[0] += 1;
    });
    _.forIn(fcgrid, function (fcui) {
      fcui.amount[0] = fcui.amount[0] / 3;
      fcui.count[0] = fcui.count[0] / 3;
    });
    return resolve(fcgrid);
  });
};

// setp 4.2: embed the main grid with fctransaction data.
const embedFcToGrid = function (data, grid, fcgrid) {
  return new Promise(function (resolve) {
    const idx = _.findIndex(data.months, ['seq', _.toNumber(moment().format(fmt.YYYYMM))]);

    _.forIn(fcgrid, function (fcui, id) {
      const ui = grid[id];

      if(ui.amount[idx] < fcui.amount[0]) {
        ui.amount[idx] = fcui.amount[0];
        ui.count[idx] = fcui.count[0];
      }
    });
    return resolve(grid);
  });
};

// setp 5: identify inactive categories with no transactions ever & remove them from grid.
const weedInactiveCats = function (grid) {
  return new Promise(function (resolve) {
    const weeds = [];

    _.forIn(grid, function (ui, id) {
      if(!ui.category.active && !_.some(ui.amount, Boolean)) {
        weeds.push(id);
      }
    });
    weeds.forEach(function (weed) {
      delete grid[weed];
    });
    return resolve(grid);
  });
};

// setp 6: sort them based on Category sort order.
const sortGridByCategory = function (data, grid) {
  return new Promise(function (resolve) {
    const gridArr = [];

    data.cats.forEach(function (cat) {
      if(grid[cat.id]) {
        gridArr.push(grid[cat.id]);
      }
    });
    return resolve(gridArr);
  });
};

// setp 7: calculate monthly total row & add it as top row.
const calcTotalRow = function (data, gridArr) {
  return new Promise(function (resolve) {
    const len = data.months.length;
    const totalui = {amount: _.fill(Array(len), 0), count: _.fill(Array(len), 0)};

    gridArr.forEach(function (ui) {
      data.months.forEach(function (month, ii) {
        totalui.amount[ii] += ui.amount[ii];
      });
    });
    totalui.amount.forEach(function (amt, i) {
      totalui.amount[i] = _.round(amt, 2);
    });

    gridArr.unshift(totalui);
    return resolve(gridArr);
  });
};

module.exports = {
  buildSummary: buildSummary,
};
