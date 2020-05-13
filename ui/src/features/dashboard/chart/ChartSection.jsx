import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// @material-ui/core
import { makeStyles } from '@material-ui/core/styles';

import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js';

import { COLOR } from 'app/config';
import { formatAmt, formatLabel } from 'features/utils';

import { selectChart } from 'features/dashboard/chart/chartSlice';

const useStyles = makeStyles(styles);

export const ChartSection = memo(() => {
  const classes = useStyles();
  const chartData = useSelector(selectChart);

  return (
    <Card style={{ marginBottom: '10px' }}>
      <CardHeader color='warning'>
        <GridContainer>
          <GridItem xs={12} sm={12} md={11}>
            <h4 className={classes.cardTitleWhite}>MONTHLY TREND</h4>
          </GridItem>
        </GridContainer>
      </CardHeader>
      <CardBody style={{ padding: '10px 20px' }}>
        <ComposedChart width={800} height={200} data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='label' tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(e) => formatAmt(e, true, true)} />
          <Tooltip
            itemStyle={{ fontSize: 12 }}
            formatter={(e, name) => [formatAmt(e, true), formatLabel(name)]}
            labelFormatter={(e) => formatLabel(e)}
          />
          <Legend formatter={(e) => formatLabel(e)} />
          <Bar dataKey='regular' stackId='a' fill={COLOR.BLUE} />
          <Bar dataKey='adhoc' stackId='a' fill={COLOR.ROSE_LIGHT} />
          <Line dataKey='total' type='monotone' stroke={COLOR.ORANGE} />
        </ComposedChart>
      </CardBody>
    </Card>
  );
});
