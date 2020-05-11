import React, { Fragment } from 'react';

import _ from 'lodash';
import classnames from 'classnames';

// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import styles from 'assets/jss/material-dashboard-react/components/tasksStyle.js';

import { COUNTS } from 'app/config';
import { buildCategoryIcon } from 'features/summary/summaryUtils';
import { ActionButton } from 'features/inputs';
import { formatAmt } from 'features/utils';

const cellStyle = { textAlign: 'right', padding: '5px 8px', fontSize: 12 };
const useStyles = makeStyles(styles);

export const SummaryData = ({ page, months, summaryData }) => {
  const classes = useStyles();
  const tableCellClasses = classnames(classes.tableCell);

  const cols = COUNTS.SUMMARY_COLS;
  const baseCol = page * cols;

  const headerData = summaryData ? summaryData[0] : {};
  const bodyData = summaryData ? summaryData.slice(1) : [];

  return (
    <Table className={classes.table}>
      <TableHead>
        <TableRow className={classes.tableRow}>
          <TableCell key={'icon'}></TableCell>
          <TableCell key={'mainDesc'}></TableCell>
          <TableCell key={'subDesc'}></TableCell>
          {months.map((col, idx) => (
            <TableCell key={idx} style={{ ...cellStyle, color: '#E91E63' }}>
              {headerData.amount && formatAmt(headerData.amount[baseCol + idx], true)}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {bodyData &&
          bodyData.map((row) => (
            <TableRow key={row.category.id} className={classes.tableRow} hover>
              <TableCell key={'icon'}>
                <ActionButton disabled color='primary' icon={buildCategoryIcon(row.category.icon)} />
              </TableCell>
              <TableCell key={'mainDesc'}>{row.category.mainDesc}</TableCell>
              <TableCell key={'subDesc'}>{row.category.subDesc}</TableCell>
              {months.map((col, idx) => (
                <TableCell key={idx} style={{ ...cellStyle }}>
                  {row.amount && formatAmt(row.amount[baseCol + idx], true)}
                </TableCell>
              ))}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};
