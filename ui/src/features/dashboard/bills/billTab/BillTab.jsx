import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import classnames from 'classnames';
import moment from 'moment';

// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

// @material-ui/icons
import PaymentIcon from '@material-ui/icons/Payment';
import DehazeIcon from '@material-ui/icons/Dehaze';
import FilterTiltShiftIcon from '@material-ui/icons/FilterTiltShift';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';

import styles from 'assets/jss/material-dashboard-react/components/tasksStyle.js';

import { COUNTS, COLOR } from 'app/config';
import { PAGINATION_BLOCK } from 'app/constants';
import { ActionButton } from 'features/inputs';
import { CustomPagination, PaginationActions } from 'features/inputs/pagination';
import { BillPayDialog } from 'features/dashboard/bills/billPay/BillPayDialog';
import { formatAmt, formatDate, getSliceForPage, getTotalAmount } from 'features/utils';
import { filterAndSortBills } from 'features/dashboard/bills/billUtils';

import { selectDashboardGlobal, setBillFilter } from 'features/dashboard/dashboardGlobalSlice';
import { selectBills, closeBill } from 'features/dashboard/bills/billTab/billTabSlice';
import { payBill } from 'features/dashboard/bills/billPay/billPaySlice';

const headers = [
  <MenuOpenIcon style={{ fontSize: 18 }} />,
  'ID',
  'ACCOUNT',
  'BILL DATE',
  'BILL AMT',
  'BALANCE',
  'DUE DATE',
  <TouchAppIcon style={{ fontSize: 18 }} />,
];
const cellStyle = { textAlign: 'center', padding: '5px 8px', fontSize: 12 };
const useStyles = makeStyles(styles);

const BillAction = ({ bill, setOpenEdit }) => {
  const dispatch = useDispatch();

  const handleBillClose = (id) => {
    dispatch(closeBill(id));
  };

  const handleBillPay = (bill) => {
    dispatch(payBill(bill));
    setOpenEdit(true);
  };

  // if bill is not closed & billDt is in the past, display CloseBill button
  if (!bill.closed && moment().isAfter(bill.billDt, 'day')) {
    return (
      <ActionButton
        title='Close Bill'
        color='primary'
        onClick={() => handleBillClose(bill.id)}
        icon={<FilterTiltShiftIcon fontSize='small' />}
      />
    );
  }

  // if bill is closed & has a balance, display PayBill button
  if (bill.closed && bill.balance > 0) {
    return (
      <ActionButton
        title='Pay Bill'
        color='primary'
        onClick={() => handleBillPay(bill)}
        icon={<PaymentIcon fontSize='small' />}
      />
    );
  }

  // if bill is closed & has a payment, display paid date.
  if (bill.closed && bill.payments && bill.payments.length > 0) {
    return formatDate(bill.payments[0].transDt);
  }

  return '';
};

export const BillTab = ({ paid, closed }) => {
  const classes = useStyles();
  const tableCellClasses = classnames(classes.tableCell);

  const dispatch = useDispatch();
  const { accountFilter, billFilter } = useSelector(selectDashboardGlobal);
  const bills = useSelector(selectBills);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(COUNTS.DASHBOARD_BILLS);
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    if (page !== 0) {
      setPage(0);
    }
  }, [accountFilter]);

  console.log('Rendering Bills.. ' + paid + ' : ' + closed);
  const filteredBills = useMemo(() => filterAndSortBills(bills, closed, paid, accountFilter), [
    bills,
    closed,
    paid,
    accountFilter,
  ]);
  const totalAmt = useMemo(() => getTotalAmount(filteredBills), [filteredBills]);
  const billsForPage = useMemo(() => getSliceForPage(filteredBills, page, rowsPerPage), [
    filteredBills,
    page,
    rowsPerPage,
  ]);

  const handleBillFilter = (id) => {
    dispatch(setBillFilter(billFilter === id ? null : id));
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Table className={classes.table}>
        <TableHead>
          <TableRow className={classes.tableRow}>
            {headers &&
              headers.map((value, idx) => (
                <TableCell key={idx} style={{ ...cellStyle, color: COLOR.ROSE }}>
                  {value}
                </TableCell>
              ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {billsForPage.map((bill) => (
            <TableRow key={bill.id} className={classes.tableRow} hover>
              <TableCell className={tableCellClasses} style={cellStyle}>
                <ActionButton
                  title='Filter Expenses'
                  color={bill.id === billFilter ? 'warning' : 'primary'}
                  onClick={() => handleBillFilter(bill.id)}
                  icon={<DehazeIcon fontSize='small' />}
                />
              </TableCell>
              <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'left' }}>
                {bill.id}
              </TableCell>
              <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'left' }}>
                {bill.account.name}
              </TableCell>
              <TableCell className={tableCellClasses} style={cellStyle}>
                {formatDate(bill.billDt)}
              </TableCell>
              <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'right' }}>
                {formatAmt(bill.amount, true)}
              </TableCell>
              <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'right' }}>
                {formatAmt(bill.balance, true)}
              </TableCell>
              <TableCell className={tableCellClasses} style={cellStyle}>
                {formatDate(bill.dueDt)}
              </TableCell>
              <TableCell className={tableCellClasses} style={cellStyle}>
                <BillAction bill={bill} setOpenEdit={setOpenEdit} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CustomPagination
        component='div'
        rowsPerPageOptions={[rowsPerPage]}
        count={filteredBills.length}
        rowsPerPage={rowsPerPage}
        page={rowsPerPage >= filteredBills.length ? 0 : page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={handleChangeRowsPerPage}
        ActionsComponent={(props) => (
          <PaginationActions {...props} section={PAGINATION_BLOCK.BILLS} totalAmt={totalAmt} />
        )}
      />
      <BillPayDialog openEdit={openEdit} setOpenEdit={setOpenEdit} />
    </>
  );
};
