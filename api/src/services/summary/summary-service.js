'use strict';

import _ from 'lodash';
import moment from 'moment';

import { config } from 'config/config';
import { FORMAT, MONTH_TYPE } from 'config/constants';

import { categoryModel, monthModel, summaryModel } from 'data/models';

import { buildMonthsList } from 'utils/month-utils';

export const buildSummary = async ({ forecast, ...others }) => {
  const { categories, months, summaries, forecastSummaries } = await getDataFromDB(others);
  const grid = buildEmptyGrid(months, categories);
  populateGrid(grid, months, summaries);
  calcYearlySummary(grid, months);
  if (forecast) {
    buildForecastGrid(grid, categories, months, summaries, forecastSummaries);
  }
  weedInactiveCategories(grid);
  const sortedGrid = sortGridByCategory(grid, categories);
  const totalRow = calcTotalRow(sortedGrid, months);
  return { months: months, gridRows: sortedGrid, totalRow: totalRow };
};

// step - 0 : initial method to fetch all data from DB..
const getDataFromDB = async ({ db, log, cityId, regular, adhoc, recurring, nonRecurring }) => {
  const categories = await categoryModel.findForCity(db, cityId);

  const transMonths = await monthModel.findForCity(db, cityId, MONTH_TYPE.TRANS);
  const _months = transMonths.map((e) => e.id);
  const months = buildMonthsList(_months, log);

  const summaries = await summaryModel.findForCity(db, cityId, regular, adhoc, recurring, nonRecurring);
  const forecastSummaries = await summaryModel.findForForecast(db, cityId);
  return { categories, months, summaries, forecastSummaries };
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
const populateGrid = (grid, months, summaries) => {
  summaries.forEach((summary) => {
    const row = grid[summary.category.id];
    const mth = _.split(summary.transMonth, '-');
    const idx = _.findIndex(months, ['seq', _.toNumber(mth[0] + mth[1])]);
    row.amounts[idx] += summary.amount;
    row.counts[idx] += summary.count;
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
const buildForecastGrid = (grid, categories, months, summaries, forecastSummaries) => {
  const forecastGrid = buildEmptyGrid(months, categories);
  populateForecastGrid(forecastGrid, forecastSummaries);
  embedForecastToGrid(grid, forecastGrid, months);
};

// step 4.1: populate the forecast grid with fctransaction data.
const populateForecastGrid = (forecastGrid, summaries) => {
  const forecastMonths = config.forecastMonths;
  summaries.forEach((summary) => {
    const row = forecastGrid[summary.category.id];
    row.amounts[0] += summary.amount;
    row.counts[0] += summary.count;
  });
  _.forIn(forecastGrid, (row) => {
    row.amounts[0] = row.amounts[0] / forecastMonths;
    row.counts[0] = row.counts[0] / forecastMonths;
  });
};

// step 4.2: embed the main grid with fctransaction data.
const embedForecastToGrid = (grid, forecastGrid, months) => {
  const idx = _.findIndex(months, ['seq', _.toNumber(moment().format(FORMAT.YYYYMM))]);
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
