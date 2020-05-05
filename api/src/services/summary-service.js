'use strict';

import _ from 'lodash';
import moment from 'moment';

import { format } from 'config/formats';
import { categoryModel, transactionModel } from 'models';
import { buildMonthsList } from 'utils/month-utils';

export const buildSummary = async (parms) => {
  const data = await getDataFromDB(parms);
  const grid = buildEmptyGrid(data);
  populateGrid(data, grid);
  calcYearlySummary(data, grid);
  if (parms.forecast) {
    buildForecastGrid(data, grid);
  }
  weedInactiveCats(grid);
  const gridArr = sortGridByCategory(data, grid);
  calcTotalRow(data, gridArr);
  return gridArr;
};

// step - 0 : initial method to fetch all data from DB..
const getDataFromDB = async (parms) => {
  const data = {};
  data.cats = await categoryModel.findForCity(parms.db, parms.cityId);
  const months = await transactionModel.findAllTransMonths(parms.db, parms.cityId);
  data.months = await buildMonthsList(months, parms.log);
  data.trans = await transactionModel.findForMonthlySummary(parms.db, parms.cityId, parms.regular, parms.adhoc);
  data.fctrans = await transactionModel.findForForecast(parms.db, parms.cityId);
  return data;
};

// step 1: build empty grid with 1 row for  each category.
const buildEmptyGrid = (data) => {
  const grid = {};
  const len = data.months.length;
  data.cats.forEach((cat) => {
    grid[cat.id] = { category: cat, amount: _.fill(Array(len), 0), count: _.fill(Array(len), 0) };
  });
  return grid;
};

// step 2: populate the grid with transaction data.
const populateGrid = (data, grid) => {
  data.trans.forEach((trans) => {
    const ui = grid[trans.category.id];
    const mth = _.split(trans.transMonth, '-');
    const idx = _.findIndex(data.months, ['seq', _.toNumber(mth[0] + mth[1])]);
    ui.amount[idx] += trans.amount;
    ui.count[idx] += 1;
  });
};

// step 3: populate the yearly summary columns with totals from the months of the year.
// yearly Summary - For each SummaryUI, populate the yearly totals by summing up the months for that year.
// pick only the non-aggregate months for totaling.
const calcYearlySummary = (data, grid) => {
  data.months.forEach((year, ii) => {
    if (year.aggregate) {
      data.months.forEach((month, jj) => {
        if (!month.aggregate && year.year === month.year) {
          _.forIn(grid, (ui) => {
            ui.amount[ii] += ui.amount[jj];
            ui.count[ii] += ui.count[jj];
          });
        }
      });
    }
  });
  return grid;
};

// step 4: build forecast grid, if the forecast flag is on. if the flag is not on, proceed forward.
const buildForecastGrid = (parms, data, grid) => {
  const fcgrid = buildEmptyGrid(data);
  populateFcGrid(data, fcgrid);
  embedFcToGrid(data, grid, fcgrid);
};

// step 4.1: populate the forecast grid with fctransaction data.
const populateFcGrid = (data, fcgrid) => {
  data.fctrans.forEach((trans) => {
    const ui = fcgrid[trans.category.id];
    ui.amount[0] += trans.amount;
    ui.count[0] += 1;
  });
  _.forIn(fcgrid, (fcui) => {
    fcui.amount[0] = fcui.amount[0] / 3;
    fcui.count[0] = fcui.count[0] / 3;
  });
};

// step 4.2: embed the main grid with fctransaction data.
const embedFcToGrid = (data, grid, fcgrid) => {
  const idx = _.findIndex(data.months, ['seq', _.toNumber(moment().format(format.YYYYMM))]);
  _.forIn(fcgrid, (fcui, id) => {
    const ui = grid[id];
    if (ui.amount[idx] < fcui.amount[0]) {
      ui.amount[idx] = fcui.amount[0];
      ui.count[idx] = fcui.count[0];
    }
  });
};

// step 5: identify inactive categories with no transactions ever & remove them from grid.
const weedInactiveCats = (grid) => {
  const weeds = [];
  _.forIn(grid, (ui, id) => {
    if (!ui.category.active && !_.some(ui.amount, Boolean)) {
      weeds.push(id);
    }
  });
  weeds.forEach((weed) => delete grid[weed]);
};

// step 6: sort them based on Category sort order.
const sortGridByCategory = (data, grid) => {
  const gridArr = [];
  data.cats.forEach((cat) => {
    if (grid[cat.id]) {
      gridArr.push(grid[cat.id]);
    }
  });
  return gridArr;
};

// step 7: calculate monthly total row & add it as top row.
const calcTotalRow = (data, gridArr) => {
  const len = data.months.length;
  const total_ui = { amount: _.fill(Array(len), 0), count: _.fill(Array(len), 0) };
  gridArr.forEach((ui) => {
    data.months.forEach((month, ii) => {
      total_ui.amount[ii] += ui.amount[ii];
    });
  });
  total_ui.amount.forEach((amt, i) => {
    total_ui.amount[i] = _.round(amt, 2);
  });
  gridArr.unshift(total_ui);
};
