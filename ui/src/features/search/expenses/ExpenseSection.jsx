import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import _ from 'lodash';
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

import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js';
import taskStyles from 'assets/jss/material-dashboard-react/components/tasksStyle.js';

import { EXPENSE_BLOCK, PAGINATION_BLOCK } from 'app/constants';
import { ActionButton } from 'features/inputs';
import { CustomPagination, PaginationActions } from 'features/inputs/pagination';
import { ExpenseEditDialog } from 'features/search/expenseEdit/ExpenseEditDialog';
import { format, formatAmt, formatDate, getSliceForPage, getTotalAmount } from 'features/utils';
import { filterAndSortExpenses, findTargetTransId } from 'features/search/expenses/expenseUtils';

import { selectDashboardGlobal } from 'features/dashboard/dashboardGlobalSlice';
import { selectExpenses, deleteExpense, swapExpenses } from 'features/search/expenses/expenseSlice';
import { editExpense, resetForm, saveEditExpense } from 'features/search/expenseEdit/expenseEditSlice';

const headers = [
  '',
  'ID',
  'ENTRY DATE',
  'TRANS',
  'CATEGORY',
  'DESCRIPTION',
  'AMOUNT',
  'FROM',
  '$ ->',
  '$',
  'TO',
  '$ ->',
  '$',
  '',
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

  const handleDelete = (id) => {
    dispatch(deleteExpense(id));
  };

  const handleMove = (id, up) => {
    const toId = findTargetTransId(filteredExpenses, id, up);
    if (toId != null) {
      dispatch(swapExpenses({ first: { id: id }, second: { id: toId } }));
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id) => {
    const exp = _.find(expensesForPage, { id: id });
    dispatch(editExpense(exp));
    setOpenEdit(true);
  };

  const handleEditCancel = () => {
    setOpenEdit(false);
    dispatch(resetForm());
  };

  const handleEditSave = (form) => {
    dispatch(saveEditExpense(form));
    setOpenEdit(false);
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
                    <TableCell key={idx} style={{ ...cellStyleDefault, color: '#E91E63' }}>
                      {value}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {expensesForPage.map((exp) => {
                const cellStyle = exp.tallied ? cellStyleDefault : { ...cellStyleDefault, color: '#00abee' };
                return (
                  <TableRow key={exp.id} className={classes.tableRow} hover>
                    <TableCell className={tableCellClasses} style={cellStyle} width='10%'>
                      <ActionButton
                        color='warning'
                        onClick={() => handleEdit(exp.id)}
                        icon={<EditIcon fontSize='small' />}
                      />
                      <ActionButton
                        color='rose'
                        onClick={() => handleDelete(exp.id)}
                        icon={<DeleteIcon fontSize='small' />}
                      />
                      <ActionButton
                        color='primary'
                        onClick={() => handleMove(exp.id, true)}
                        icon={<ArrowUpwardIcon fontSize='small' />}
                      />
                      <ActionButton
                        color='primary'
                        onClick={() => handleMove(exp.id, false)}
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
            onChangePage={(e, newPage) => setPage(newPage)}
            onChangeRowsPerPage={handleChangeRowsPerPage}
            ActionsComponent={(props) => (
              <PaginationActions {...props} section={PAGINATION_BLOCK.EXPENSES} totalAmt={totalAmt} />
            )}
          />
        </CardBody>
      </Card>
      <ExpenseEditDialog openEdit={openEdit} onEditSave={handleEditSave} onEditCancel={handleEditCancel} />
    </>
  );
};
