'use strict';

import _ from 'lodash';
import moment from 'moment';

import { format } from 'config/formats';
import { categoryModel, transactionModel } from 'models';
import { buildMonthsList } from 'utils/month-utils';

export const buildSummary = async (parms) => {
  const data = await getDataFromDB(parms);
  const grid = buildEmptyGrid(data.months, data.categories);
  populateGrid(grid, data.trans, data.months);
  calcYearlySummary(grid, data.months);
  if (parms.forecast) {
    buildForecastGrid(grid, data);
  }
  weedInactiveCategories(grid);
  const sortedGrid = sortGridByCategory(grid, data.categories);
  const totalRow = calcTotalRow(sortedGrid, data.months);
  return { months: data.months, gridRows: sortedGrid, totalRow: totalRow };
};

// step - 0 : initial method to fetch all data from DB..
const getDataFromDB = async (parms) => {
  const data = {};
  data.categories = await categoryModel.findForCity(parms.db, parms.cityId);
  const months = await transactionModel.findAllTransMonths(parms.db, parms.cityId);
  data.months = buildMonthsList(months, parms.log);
  data.trans = await transactionModel.findForMonthlySummary(parms.db, parms.cityId, parms.regular, parms.adhoc);
  data.fctrans = await transactionModel.findForForecast(parms.db, parms.cityId);
  return data;
};

// step 1: build empty grid with 1 row for  each category.
const buildEmptyGrid = (months, categories) => {
  const grid = {};
  const len = months.length;
  categories.forEach((e) => {
    grid[e.id] = { category: e, amounts: _.fill(Array(len), 0), counts: _.fill(Array(len), 0) };
  });
  return grid;
};

// step 2: populate the grid with transaction data.
const populateGrid = (grid, trans, months) => {
  trans.forEach((trans) => {
    const row = grid[trans.category.id];
    const mth = _.split(trans.transMonth, '-');
    const idx = _.findIndex(months, ['seq', _.toNumber(mth[0] + mth[1])]);
    row.amounts[idx] += trans.amount;
    row.counts[idx] += 1;
  });
};

// step 3: populate the yearly summary columns with totals from the months of the year.
// yearly Summary - For each SummaryUI, populate the yearly totals by summing up the months for that year.
// pick only the non-aggregate months for totaling.
const calcYearlySummary = (grid, months) => {
  months.forEach((year, ii) => {
    if (year.aggregate) {
      months.forEach((month, jj) => {
        if (!month.aggregate && year.year === month.year) {
          _.forIn(grid, (row) => {
            row.amounts[ii] += row.amounts[jj];
            row.counts[ii] += row.counts[jj];
          });
        }
      });
    }
  });
  return grid;
};

// step 4: build forecast grid, if the forecast flag is on. if the flag is not on, proceed forward.
const buildForecastGrid = (grid, data) => {
  const forecastGrid = buildEmptyGrid(data.months, data.categories);
  populateForecastGrid(forecastGrid, data.fctrans);
  embedForecastToGrid(grid, forecastGrid, data.months);
};

// step 4.1: populate the forecast grid with fctransaction data.
const populateForecastGrid = (forecastGrid, fctrans) => {
  fctrans.forEach((trans) => {
    const row = forecastGrid[trans.category.id];
    row.amounts[0] += trans.amount;
    row.counts[0] += 1;
  });
  _.forIn(forecastGrid, (row) => {
    row.amounts[0] = row.amounts[0] / 3;
    row.counts[0] = row.counts[0] / 3;
  });
};

// step 4.2: embed the main grid with fctransaction data.
const embedForecastToGrid = (grid, forecastGrid, months) => {
  const idx = _.findIndex(months, ['seq', _.toNumber(moment().format(format.YYYYMM))]);
  _.forIn(forecastGrid, (forecastRow, id) => {
    const row = grid[id];
    if (row.amounts[idx] < forecastRow.amounts[0]) {
      row.amounts[idx] = forecastRow.amounts[0];
      row.counts[idx] = forecastRow.counts[0];
    }
  });
};

// step 5: identify inactive categories with no transactions ever & remove them from grid.
const weedInactiveCategories = (grid) => {
  const weeds = [];
  _.forIn(grid, (row, id) => {
    if (!row.category.active && !_.some(row.amounts, Boolean)) {
      weeds.push(id);
    }
  });
  weeds.forEach((weed) => delete grid[weed]);
};

// step 6: sort them based on Category sort order.
const sortGridByCategory = (grid, categories) => {
  return categories.filter((e) => grid[e.id]).map((e) => grid[e.id]);
};

// step 7: calculate monthly total row.
const calcTotalRow = (grid, months) => {
  const len = months.length;
  const totalRow = { amounts: _.fill(Array(len), 0), counts: _.fill(Array(len), 0) };
  grid.forEach((row) => {
    months.forEach((month, ii) => {
      totalRow.amounts[ii] += row.amounts[ii];
    });
  });
  totalRow.amounts.forEach((amt, i) => {
    totalRow.amounts[i] = _.round(amt, 2);
  });
  return totalRow;
};
