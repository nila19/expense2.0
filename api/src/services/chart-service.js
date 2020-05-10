'use strict';

import { transactionModel } from 'models';
import { buildSummary } from 'services/summary-service';
import { buildMonthsList } from 'utils/month-utils';

export const buildChart = async (parms) => {
  const data = await transactionModel.findAllTransMonths(parms.db, parms.cityId);
  const months = buildMonthsList(data);
  const regular = await buildSummary({ ...parms, regular: true, adhoc: false });
  const adhoc = await buildSummary({ ...parms, regular: false, adhoc: true });
  return loadChartData(months, regular[0], adhoc[0]);
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
