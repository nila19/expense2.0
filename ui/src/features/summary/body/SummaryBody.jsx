import React from 'react';

// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Tooltip from '@material-ui/core/Tooltip';

import styles from 'assets/jss/material-dashboard-react/components/tasksStyle.js';

import { COUNTS } from 'app/config';
import { buildCategoryIcon } from 'features/summary/summaryUtils';
import { ActionButton } from 'features/inputs';
import { formatAmt } from 'features/utils';

const cellStyle = { textAlign: 'right', padding: '12px 8px', fontSize: 12 };
const useStyles = makeStyles(styles);

const CustomCell = (row, idx, header, aggregate) => {
  const bgColor = aggregate ? (header ? '#ffc300' : '#51d1e1') : 'white';
  const bgColorHover = '#f06493';
  const colorHover = 'white';
  const color = aggregate ? 'white' : header ? '#E91E63' : '#212121';
  const bold = aggregate || header ? { fontWeight: 'bold' } : {};

  const onClick = () => {
    console.log((row.category && row.category.id) + ' : ' + idx);
  };

  const onMouseEnter = (e) => {
    e.target.style.backgroundColor = bgColorHover;
    e.target.style.color = colorHover;
  };

  const onMouseLeave = (e) => {
    e.target.style.backgroundColor = bgColor;
    e.target.style.color = color;
  };

  const count = row.count && row.count[idx];
  const cursor = header || count > 0 ? { cursor: 'pointer' } : {};
  const events = header || count > 0 ? { onClick, onMouseEnter, onMouseLeave } : {};

  return (
    <Tooltip key={idx} title={count > 1 ? count : ''} placement='right-start'>
      <TableCell
        {...events}
        style={{
          ...cellStyle,
          ...{ backgroundColor: bgColor },
          ...{ color: color },
          ...bold,
          ...cursor,
        }}
      >
        {row.amount && formatAmt(row.amount[idx], true)}
      </TableCell>
    </Tooltip>
  );
};

export const SummaryBody = ({ page, months, summaryData }) => {
  const classes = useStyles();

  const cols = COUNTS.SUMMARY_COLS;
  const baseIdx = page * cols;

  const headerData = summaryData ? summaryData[0] : {};
  const bodyData = summaryData ? summaryData.slice(1) : [];

  return (
    <>
      {headerData && (
        <TableRow className={classes.tableRow} hover>
          <TableCell colSpan={3}></TableCell>
          {months.map((col, idx) => CustomCell(headerData, baseIdx + idx, true, col.aggregate))}
        </TableRow>
      )}
      {bodyData &&
        bodyData.map((row) => (
          <TableRow key={row.category.id} className={classes.tableRow} hover>
            <TableCell style={{ ...cellStyle, textAlign: 'center' }}>
              <ActionButton disabled color='primary' icon={buildCategoryIcon(row.category.icon)} />
            </TableCell>
            <TableCell style={{ ...cellStyle, textAlign: 'left' }}>{row.category.mainDesc}</TableCell>
            <TableCell style={{ ...cellStyle, textAlign: 'left' }}>{row.category.subDesc}</TableCell>
            {months.map((col, idx) => CustomCell(row, baseIdx + idx, false, col.aggregate))}
          </TableRow>
        ))}
    </>
  );
};
