'use strict';

import { MONTH_TYPE } from 'config/formats';
import { monthModel } from 'models';
import { buildSummary } from 'services/summary/summary-service';
import { buildMonthsList } from 'utils/month-utils';

export const buildChart = async ({ db, log, cityId }) => {
  const transMonths = await monthModel.findForCity(db, cityId, MONTH_TYPE.TRANS);
  const data = transMonths.map((e) => e.id);
  const months = buildMonthsList(data);
  const regular = await buildSummary({ db, log, cityId, regular: true, adhoc: false });
  const adhoc = await buildSummary({ db, log, cityId, regular: false, adhoc: true });
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
