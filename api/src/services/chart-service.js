'use strict';

import { transactionModel } from 'models';
import { buildSummary } from 'services/summary-service';
import { buildMonthsList } from 'utils/month-utils';

export const buildChart = async (parms) => {
  const data = await transactionModel.findAllTransMonths(parms.db, parms.cityId);
  const months = buildMonthsList(data);
  const regular = await buildSummary({ ...parms, regular: true, adhoc: false });
  const adhoc = await buildSummary({ ...parms, regular: false, adhoc: true });
  return loadChartData(months, regular.totalRow, adhoc.totalRow);
};

const loadChartData = (months, regular, adhoc) => {
  const chart = { labels: [], regulars: [], adhocs: [], totals: [] };
  months.forEach((m, i) => {
    if (!m.aggregate) {
      chart.labels.push(m.name);
      chart.regulars.push(regular.amounts[i]);
      chart.adhocs.push(adhoc.amounts[i]);
      chart.totals.push(regular.amounts[i] + adhoc.amounts[i]);
    }
  });
  return chart;
};
