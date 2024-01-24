import React from 'react';

import _ from 'lodash';

import makeStyles from '@mui/styles/makeStyles';

import { TableCell, TableRow } from '@mui/material';

import { COLOR } from 'app/config';

import { SummaryControl } from 'features/summary/header/SummaryControl';

const useStyles = makeStyles(() => ({
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLOR.ORANGE,
  },
  tableRow: {
    marginTop: '0px',
  },
}));

const MonthNames = ({ monthsForPage }) => {
  const classes = useStyles();

  return (
    <>
      {monthsForPage &&
        monthsForPage.map((e) => (
          <TableCell key={e.id} align='right' style={{ verticalAlign: 'center' }}>
            <span className={classes.label}>{_.toUpper(e.name)}</span>
          </TableCell>
        ))}
    </>
  );
};

export const SummaryHeader = ({ monthsForPage, ...controlProps }) => {
  const classes = useStyles();

  return (
    <TableRow className={classes.tableRow}>
      <TableCell colSpan={3} style={{ verticalAlign: 'center' }}>
        <SummaryControl {...controlProps} />
      </TableCell>
      <MonthNames monthsForPage={monthsForPage} />
    </TableRow>
  );
};
