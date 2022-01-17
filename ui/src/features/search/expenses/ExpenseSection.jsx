import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import classnames from 'classnames';
import moment from 'moment';

// @material-ui/core
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import CircularProgress from '@material-ui/core/CircularProgress';

// @material-ui/icons
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import TransformIcon from '@material-ui/icons/Transform';
import ShoppingBasketIcon from '@material-ui/icons/ShoppingBasket';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import KeyboardTabIcon from '@material-ui/icons/KeyboardTab';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import FlagIcon from '@material-ui/icons/Flag';

import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js';
import taskStyles from 'assets/jss/material-dashboard-react/components/tasksStyle.js';

import { COLOR } from 'app/config';
import { EXPENSE_BLOCK, PAGINATION_BLOCK } from 'app/constants';
import { ActionButton } from 'features/inputs';
import { CustomPagination, PaginationActions } from 'features/inputs/pagination';
import { ExpenseEditDialog } from 'features/search/expenseEdit/ExpenseEditDialog';
import { format, formatAmt, formatDate, getSliceForPage, getTotalAmount } from 'features/utils';
import { filterAndSortExpenses, findTargetTransId } from 'features/search/expenses/expenseUtils';

import { selectDashboardGlobal } from 'features/dashboard/dashboardGlobalSlice';
import { selectExpenses, deleteExpense, swapExpenses } from 'features/search/expenses/expenseSlice';
import { editExpense } from 'features/search/expenseEdit/expenseEditSlice';

const headers = [
  <TouchAppIcon style={{ fontSize: 18 }} />,
  'ID',
  'ENTRY DATE',
  'TRANS',
  'CATEGORY',
  'DESCRIPTION',
  'AMOUNT',
  'FROM',
  <TrendingFlatIcon style={{ fontSize: 18 }} />,
  <KeyboardTabIcon style={{ fontSize: 18 }} />,
  'TO',
  <TrendingFlatIcon style={{ fontSize: 18 }} />,
  <KeyboardTabIcon style={{ fontSize: 18 }} />,
  <FlagIcon style={{ fontSize: 18 }} />,
];
const cellStyleDefault = { textAlign: 'center', padding: '5px 8px', fontSize: 12 };
const useStyles = makeStyles(styles);
const useTaskStyles = makeStyles(taskStyles);

export const ExpenseSection = ({ section, rowsPerPage, setRowsPerPage }) => {
  const classes = useStyles();
  const taskClasses = useTaskStyles();
  const tableCellClasses = classnames(taskClasses.tableCell);

  const dispatch = useDispatch();
  const { data, loading, searchResults } = useSelector(selectExpenses);
  const { accountFilter, billFilter } = useSelector(selectDashboardGlobal);

  let expenses = data;
  if (section === EXPENSE_BLOCK.SEARCH && searchResults) {
    expenses = searchResults;
  }

  const [page, setPage] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    if (page !== 0) {
      setPage(0);
    }
  }, [accountFilter, billFilter]);

  console.log('Rendering Expense..');
  const filteredExpenses = useMemo(() => filterAndSortExpenses(expenses, accountFilter, billFilter), [
    expenses,
    accountFilter,
    billFilter,
  ]);
  const totalAmt = useMemo(() => getTotalAmount(filteredExpenses), [filteredExpenses]);
  const expensesForPage = useMemo(() => getSliceForPage(filteredExpenses, page, rowsPerPage), [
    filteredExpenses,
    page,
    rowsPerPage,
  ]);

  const handleDelete = (exp) => {
    dispatch(deleteExpense(exp.id));
  };

  const handleMove = (exp, up) => {
    const toId = findTargetTransId(filteredExpenses, exp.id, up);
    if (toId != null) {
      dispatch(swapExpenses({ first: { id: exp.id }, second: { id: toId } }));
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (exp) => {
    dispatch(editExpense(exp));
    setOpenEdit(true);
  };

  return (
    <>
      <Card style={{ marginBottom: '10px' }}>
        <CardHeader color='info'>
          <GridContainer>
            <GridItem xs={12} sm={12} md={11}>
              <h4 className={classes.cardTitleWhite}>EXPENSES</h4>
            </GridItem>
            <GridItem xs={12} sm={12} md={1}>
              <div style={{ paddingLeft: 60 }}>
                {loading && <CircularProgress color='secondary' style={{ width: 14, height: 14 }} />}
              </div>
            </GridItem>
          </GridContainer>
        </CardHeader>
        <CardBody style={{ padding: '10px 20px' }}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow className={classes.tableRow}>
                {headers &&
                  headers.map((value, idx) => (
                    <TableCell key={idx} style={{ ...cellStyleDefault, color: COLOR.ROSE }}>
                      {value}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {expensesForPage.map((exp) => {
                const cellStyle = exp.tallied ? cellStyleDefault : { ...cellStyleDefault, color: COLOR.BLUE };
                return (
                  <TableRow key={exp.id} className={classes.tableRow} hover>
                    <TableCell className={tableCellClasses} style={cellStyle} width='10%'>
                      <ActionButton
                        title='Edit'
                        color='warning'
                        onClick={() => handleEdit(exp)}
                        icon={<EditIcon fontSize='small' />}
                      />
                      <ActionButton
                        title='Delete'
                        color='rose'
                        onClick={() => handleDelete(exp)}
                        icon={<DeleteIcon fontSize='small' />}
                      />
                      <ActionButton
                        title='Move up'
                        color='primary'
                        onClick={() => handleMove(exp, true)}
                        icon={<ArrowUpwardIcon fontSize='small' />}
                      />
                      <ActionButton
                        title='Move down'
                        color='primary'
                        onClick={() => handleMove(exp, false)}
                        icon={<ArrowDownwardIcon fontSize='small' />}
                      />
                    </TableCell>
                    <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'left' }}>
                      {exp.id}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={cellStyle}>
                      {moment(exp.entryDt, format.YYYYMMDDHHmmss).format(format.DDMMMYYYYHHMM)}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={cellStyle}>
                      {formatDate(exp.transDt, format.DDMMM)}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'left' }}>
                      {exp.category ? exp.category.name : '-'}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'left' }}>
                      {exp.description}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'right' }}>
                      {formatAmt(exp.amount, false)}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'left' }}>
                      {exp.accounts.from ? exp.accounts.from.name : '-'}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'right' }}>
                      {exp.accounts.from ? formatAmt(exp.accounts.from.balanceBf, false) : '-'}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'right' }}>
                      {exp.accounts.from ? formatAmt(exp.accounts.from.balanceAf, false) : '-'}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'left' }}>
                      {exp.accounts.to ? exp.accounts.to.name : '-'}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'right' }}>
                      {exp.accounts.to ? formatAmt(exp.accounts.to.balanceBf, false) : '-'}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'right' }}>
                      {exp.accounts.to ? formatAmt(exp.accounts.to.balanceAf, false) : '-'}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={cellStyle}>
                      <ActionButton
                        disabled
                        color='primary'
                        icon={
                          exp.adjust ? (
                            <TransformIcon fontSize='small' />
                          ) : exp.adhoc ? (
                            <ShoppingBasketIcon fontSize='small' />
                          ) : (
                            ''
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <CustomPagination
            component='div'
            rowsPerPageOptions={[rowsPerPage]}
            count={filteredExpenses.length}
            rowsPerPage={rowsPerPage}
            page={rowsPerPage >= filteredExpenses.length ? 0 : page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={(props) => (
              <PaginationActions {...props} section={PAGINATION_BLOCK.EXPENSES} totalAmt={totalAmt} />
            )}
          />
        </CardBody>
      </Card>
      <ExpenseEditDialog openEdit={openEdit} setOpenEdit={setOpenEdit} />
    </>
  );
};
