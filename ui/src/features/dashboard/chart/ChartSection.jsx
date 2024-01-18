import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import { AppSection } from 'components/app/AppSection';

import { COLOR } from 'app/config';
import { formatAmt, formatLabel } from 'features/utils';

import { selectChart } from 'features/dashboard/chart/chartSlice';

export const ChartSection = memo(() => {
  const chartData = useSelector(selectChart);

  const chartContent = (
    <ComposedChart width={800} height={200} data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
      <CartesianGrid strokeDasharray='3 3' />
      <XAxis dataKey='label' tick={{ fontSize: 11 }} />
      <YAxis tick={{ fontSize: 11 }} tickFormatter={(e) => formatAmt(e, true, true)} />
      <Tooltip
        itemStyle={{ fontSize: 12 }}
        formatter={(e, name) => [formatAmt(e, true), formatLabel(name)]}
        labelFormatter={(e) => formatLabel(e)}
      />
      <Legend formatter={(e) => <span style={{ fontSize: 14 }}>{formatLabel(e)}</span>} />
      <Bar dataKey='regular' stackId='a' fill={COLOR.BLUE} />
      <Bar dataKey='adhoc' stackId='a' fill={COLOR.ROSE_LIGHT} />
      <Line dataKey='total' type='monotone' stroke={COLOR.ORANGE} />
    </ComposedChart>
  );

  return <AppSection title='MONTHLY TREND' headerColor='warning' content={chartContent} />;
});
