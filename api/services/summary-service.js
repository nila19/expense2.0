'use strict';

import Promise from 'bluebird';
import moment from 'moment';
import _ from 'lodash';

import { categories, transactions } from '../models';

import format from '../config/formats';
import { buildMonthsList } from '../utils/month-utils';
import { logErr } from '../utils/common-utils';

export const buildSummary = parms => {
  return new Promise((resolve, reject) => {
    let _data = null;
    getDataFromDB(parms)
      .then(data => {
        _data = data;
        return buildEmptyGrid(_data);
      })
      .then(grid => populateGrid(_data, grid))
      .then(grid => calcYearlySummary(_data, grid))
      .then(grid => buildForecastGrid(parms, _data, grid))
      .then(grid => weedInactiveCats(grid))
      .then(grid => sortGridByCategory(_data, grid))
      .then(gridArr => calcTotalRow(_data, gridArr))
      .then(gridArr => resolve(gridArr))
      .catch(err => {
        logErr(parms.log, err);
        return reject(err);
      });
  });
};

// step - 0 : initial method to fetch all data from DB..
const getDataFromDB = parms => {
  return new Promise((resolve, reject) => {
    const data = {};
    categories
      .findForCity(parms.db, parms.cityId)
      .then(cats => {
        data.cats = cats;
        return transactions.findAllTransMonths(parms.db, parms.cityId);
      })
      .then(months => buildMonthsList(months, parms.log))
      .then(months => {
        data.months = months;
        return transactions.findForMonthlySummary(parms.db, parms.cityId, parms.regular, parms.adhoc);
      })
      .then(trans => {
        data.trans = trans;
        return transactions.findForForecast(parms.db, parms.cityId);
      })
      .then(trans => {
        data.fctrans = trans;
        resolve(data);
      })
      .catch(err => reject(err));
  });
};

// step 1: build empty grid with 1 row for  each category.
const buildEmptyGrid = data => {
  return new Promise(resolve => {
    const grid = {};
    const len = data.months.length;
    data.cats.forEach(cat => {
      grid[cat.id] = { category: cat, amount: _.fill(Array(len), 0), count: _.fill(Array(len), 0) };
    });
    return resolve(grid);
  });
};

// step 2: populate the grid with transaction data.
const populateGrid = (data, grid) => {
  return new Promise(resolve => {
    data.trans.forEach(trans => {
      const ui = grid[trans.category.id];
      const mth = _.split(trans.transMonth, '-');
      const idx = _.findIndex(data.months, ['seq', _.toNumber(mth[0] + mth[1])]);
      ui.amount[idx] += trans.amount;
      ui.count[idx] += 1;
    });
    return resolve(grid);
  });
};

// step 3: populate the yearly summary columns with totals from the months of the year.
// yearly Summary - For each SummaryUI, populate the yearly totals by summing up the months for that year.
// pick only the non-aggregate months for totaling.
const calcYearlySummary = (data, grid) => {
  return new Promise(resolve => {
    data.months.forEach((year, ii) => {
      if (year.aggregate) {
        data.months.forEach((month, jj) => {
          if (!month.aggregate && year.year === month.year) {
            _.forIn(grid, ui => {
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

// step 4: build forecast grid, if the forecast flag is on. if the flag is not on, proceed forward.
const buildForecastGrid = (parms, data, grid) => {
  return new Promise((resolve, reject) => {
    if (!parms.forecast) {
      return resolve(grid);
    }
    buildEmptyGrid(data)
      .then(fcgrid => populateFcGrid(data, fcgrid))
      .then(fcgrid => embedFcToGrid(data, grid, fcgrid))
      .then(grid => resolve(grid))
      .catch(err => reject(err));
  });
};

// step 4.1: populate the forecast grid with fctransaction data.
const populateFcGrid = (data, fcgrid) => {
  return new Promise(resolve => {
    data.fctrans.forEach(trans => {
      const ui = fcgrid[trans.category.id];
      ui.amount[0] += trans.amount;
      ui.count[0] += 1;
    });
    _.forIn(fcgrid, fcui => {
      fcui.amount[0] = fcui.amount[0] / 3;
      fcui.count[0] = fcui.count[0] / 3;
    });
    return resolve(fcgrid);
  });
};

// step 4.2: embed the main grid with fctransaction data.
const embedFcToGrid = (data, grid, fcgrid) => {
  return new Promise(resolve => {
    const idx = _.findIndex(data.months, ['seq', _.toNumber(moment().format(format.YYYYMM))]);
    _.forIn(fcgrid, (fcui, id) => {
      const ui = grid[id];
      if (ui.amount[idx] < fcui.amount[0]) {
        ui.amount[idx] = fcui.amount[0];
        ui.count[idx] = fcui.count[0];
      }
    });
    return resolve(grid);
  });
};

// step 5: identify inactive categories with no transactions ever & remove them from grid.
const weedInactiveCats = grid => {
  return new Promise(resolve => {
    const weeds = [];
    _.forIn(grid, (ui, id) => {
      if (!ui.category.active && !_.some(ui.amount, Boolean)) {
        weeds.push(id);
      }
    });
    weeds.forEach(weed => delete grid[weed]);
    return resolve(grid);
  });
};

// step 6: sort them based on Category sort order.
const sortGridByCategory = (data, grid) => {
  return new Promise(resolve => {
    const gridArr = [];
    data.cats.forEach(cat => {
      if (grid[cat.id]) {
        gridArr.push(grid[cat.id]);
      }
    });
    return resolve(gridArr);
  });
};

// step 7: calculate monthly total row & add it as top row.
const calcTotalRow = (data, gridArr) => {
  return new Promise(resolve => {
    const len = data.months.length;
    const total_ui = { amount: _.fill(Array(len), 0), count: _.fill(Array(len), 0) };
    gridArr.forEach(ui => {
      data.months.forEach((month, ii) => {
        total_ui.amount[ii] += ui.amount[ii];
      });
    });
    total_ui.amount.forEach((amt, i) => {
      total_ui.amount[i] = _.round(amt, 2);
    });
    gridArr.unshift(total_ui);
    return resolve(gridArr);
  });
};
