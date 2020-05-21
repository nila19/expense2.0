import React from 'react';

import _ from 'lodash';

import { makeStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js';

import { COLOR } from 'app/config';

import { SummaryControl } from 'features/summary/header/SummaryControl';

const tableStyles = makeStyles(styles);

const useStyles = makeStyles(() => ({
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLOR.ORANGE,
  },
}));

const MonthNames = ({ monthsForPage }) => {
  const classes = useStyles();

  return (
    <>
      {monthsForPage &&
        monthsForPage.map((e) => (
          <TableCell key={e.id} style={{ marginTop: '10px', textAlign: 'center' }}>
            <span className={classes.label}>{_.toUpper(e.name)}</span>
          </TableCell>
        ))}
    </>
  );
};

export const SummaryHeader = ({ monthsForPage, ...controlProps }) => {
  const classes = tableStyles();

  return (
    <TableRow className={classes.tableRow}>
      <TableCell colSpan={3}>
        <SummaryControl {...controlProps} />
      </TableCell>
      <MonthNames monthsForPage={monthsForPage} />
    </TableRow>
  );
};
