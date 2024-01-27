import React from 'react';
import { useDispatch } from 'react-redux';

import _ from 'lodash';

import makeStyles from '@mui/styles/makeStyles';

import { TableRow, TableCell, Tooltip } from '@mui/material';

import { COUNTS, COLOR } from 'app/config';
import { AppIcon } from 'components/app/AppIcon';
import { formatAmt } from 'features/utils';

import { searchExpenses, setSummaryFilter } from 'features/search/expenses/expenseSlice';

const cellStyle = { textAlign: 'right', padding: '8px 8px', fontSize: 12 };

const useStyles = makeStyles(() => ({
  tableRow: {
    marginTop: '0px',
  },
}));

const SummaryCell = ({ row, month, idx, header, setGoToSearch }) => {
  const dispatch = useDispatch();

  const bgColor = month.aggregate ? (header ? COLOR.ORANGE : COLOR.BLUE_GREEN) : COLOR.WHITE;
  const bgColorHover = COLOR.ROSE_LIGHT;
  const colorHover = COLOR.WHITE;
  const color = month.aggregate ? COLOR.WHITE : header ? COLOR.ROSE : COLOR.BLACK;
  const bold = month.aggregate || header ? { fontWeight: 'bold' } : {};

  const onClick = () => {
    let searchForm = { transMonth: { id: month.id, year: month.aggregate } };
    if (row.category && row.category.id) {
      searchForm = _.set(searchForm, 'category.id', row.category.id);
    }
    dispatch(searchExpenses(searchForm));
    dispatch(setSummaryFilter(searchForm));
    setGoToSearch(true);
  };

  const onMouseEnter = (e) => {
    e.target.style.backgroundColor = bgColorHover;
    e.target.style.color = colorHover;
  };

  const onMouseLeave = (e) => {
    e.target.style.backgroundColor = bgColor;
    e.target.style.color = color;
  };

  const count = row.counts && row.counts[idx];
  const cursor = header || count > 0 ? { cursor: 'pointer' } : {};
  const events = header || count > 0 ? { onClick, onMouseEnter, onMouseLeave } : {};

  return (
    <Tooltip title={count > 0 ? count : ''} placement='right-start'>
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
        {row.amounts && formatAmt(row.amounts[idx], true)}
      </TableCell>
    </Tooltip>
  );
};

export const SummaryBody = ({ page, monthsForPage, gridRows, totalRow, setGoToSearch }) => {
  const classes = useStyles();

  const baseIdx = page * COUNTS.SUMMARY_COLS;

  return (
    <>
      {totalRow && (
        <TableRow className={classes.tableRow} hover>
          <TableCell colSpan={3}></TableCell>
          {monthsForPage.map((month, idx) => (
            <SummaryCell
              key={idx}
              row={totalRow}
              month={month}
              idx={baseIdx + idx}
              header={true}
              setGoToSearch={setGoToSearch}
            />
          ))}
        </TableRow>
      )}
      {gridRows &&
        gridRows.map((row) => (
          <TableRow key={row.category.id} className={classes.tableRow} hover>
            <TableCell style={{ ...cellStyle, textAlign: 'center' }}>
              <AppIcon icon={row.category.icon} fontSize='medium' />
            </TableCell>
            <TableCell style={{ ...cellStyle, textAlign: 'left' }}>{row.category.mainDesc}</TableCell>
            <TableCell style={{ ...cellStyle, textAlign: 'left' }}>{row.category.subDesc}</TableCell>
            {monthsForPage.map((month, idx) => (
              <SummaryCell
                key={idx}
                row={row}
                month={month}
                idx={baseIdx + idx}
                header={false}
                setGoToSearch={setGoToSearch}
              />
            ))}
          </TableRow>
        ))}
    </>
  );
};
