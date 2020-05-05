'use strict';

import { transactionModel } from 'models';
import { buildSummary } from 'services/summary-service';
import { buildMonthsList } from 'utils/month-utils';

export const buildChart = async (parms) => {
  const data = await transactionModel.findAllTransMonths(parms.db, parms.cityId);
  const months = buildMonthsList(data);
  const regular = buildSummary({ ...parms, regular: true, adhoc: false })[0];
  const adhoc = buildSummary({ ...parms, regular: false, adhoc: true })[0];
  return loadChartData(months, regular, adhoc);
};

const loadChartData = (months, regular, adhoc) => {
  const chart = { labels: [], regulars: [], adhocs: [], totals: [] };
  months.forEach((m, i) => {
    if (!m.aggregate) {
      chart.labels.push(m.name);
      chart.regulars.push(regular.amount[i]);
      chart.adhocs.push(adhoc.amount[i]);
      chart.totals.push(regular.amount[i] + adhoc.amount[i]);
    }
  });
  return chart;
};
