'use strict';

import _ from 'lodash';

import { MONTH_TYPE } from 'config/constants';

import { categoryModel, monthModel, transactionModel } from 'data/models';

import { buildMonthsList } from 'utils/month-utils';

export const buildSummary = async (parms) => {
  const data = await getDataFromDB(parms);
  const grid = buildEmptyGrid(data.months, data.categories);
  populateGrid(grid, data.trans, data.months);
  const sortedGrid = sortGridByCategory(grid, data.categories);
  return { months: data.months, gridRows: sortedGrid };
};

// step - 0 : initial method to fetch all data from DB..
const getDataFromDB = async ({ db, log, cityId, regular, adhoc }) => {
  const data = {};
  data.categories = await categoryModel.findForCity(db, cityId);

  const transMonths = await monthModel.findForCity(db, cityId, MONTH_TYPE.TRANS);
  const months = transMonths.map((e) => e.id);
  data.months = buildMonthsList(months, log);

  data.trans = await transactionModel.findForMonthlySummary(db, cityId, regular, adhoc);
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
    const mth = _.split(trans.transMonth, '-');
    const idx = _.findIndex(months, ['seq', _.toNumber(mth[0] + mth[1])]);
    const row = grid[trans.category.id];
    if (row) {
      row.amounts[idx] += trans.amount;
      row.counts[idx] += 1;
    }
  });
};

// step 6: sort them based on Category sort order.
const sortGridByCategory = (grid, categories) => {
  return categories.filter((e) => grid[e.id]).map((e) => grid[e.id]);
};
