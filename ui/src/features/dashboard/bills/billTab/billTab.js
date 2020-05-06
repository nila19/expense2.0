import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import _ from 'lodash';
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

import styles from 'assets/jss/material-dashboard-react/components/tasksStyle.js';

import { COUNTS } from 'app/config';
import { ActionButton } from 'features/inputs/formFields';
import { CustomPagination, PaginationActions } from 'features/inputs/customPagination';
import { formatAmt, formatDate, getSliceForPage, getTotalAmount } from 'features/utils';
import { BillPayDialog } from 'features/dashboard/bills/billPay/billPayDialog';
import { filterAndSortBills } from 'features/dashboard/bills/billUtils';

import { selectDashboardGlobal, setBillFilter } from 'features/dashboard/dashboardGlobalSlice';
import { selectBills, closeBill } from 'features/dashboard/bills/billTab/billTabSlice';
import { payBill, resetBillPay, savePayBill } from 'features/dashboard/bills/billPay/billPaySlice';

const headers = ['', 'ID', 'ACCOUNT', 'BILL DATE', 'BILL AMT', 'BALANCE', 'DUE DATE', 'ACTION'];
const cellStyle = { textAlign: 'center', padding: '5px 8px', fontSize: 12 };
const useStyles = makeStyles(styles);

export const BillTab = ({ paid, closed }) => {
  const classes = useStyles();
  const tableCellClasses = classnames(classes.tableCell);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(COUNTS.DASHBOARD_BILLS);
  const [openEdit, setOpenEdit] = useState(false);

  const dispatch = useDispatch();
  const { accountFilter, billFilter } = useSelector(selectDashboardGlobal);
  const bills = useSelector(selectBills);

  useEffect(() => {
    setPage(0);
  }, [accountFilter]);

  const filteredBills = filterAndSortBills(bills, closed, paid, accountFilter);
  const billsForPage = getSliceForPage(filteredBills, page, rowsPerPage);
  const total = getTotalAmount(billsForPage);

  const handleBillFilter = (id) => {
    dispatch(setBillFilter(billFilter === id ? null : id));
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleBillPay = (id) => {
    const bill = _.find(bills, { id: id });
    dispatch(payBill(bill));
    setOpenEdit(true);
  };

  const handleEditCancel = () => {
    dispatch(resetBillPay());
    setOpenEdit(false);
  };

  const handleEditSave = (form) => {
    dispatch(savePayBill(form));
    setOpenEdit(false);
  };

  const handleBillClose = (id) => {
    dispatch(closeBill(id));
  };

  const buildBillAction = (bill) => {
    let billAction = '';
    if (bill.closed === false) {
      billAction = moment().isAfter(bill.billDt, 'day') ? (
        <ActionButton
          color='primary'
          onClick={() => handleBillClose(bill.id)}
          icon={<FilterTiltShiftIcon fontSize='small' />}
        />
      ) : (
        ''
      );
    } else {
      billAction = bill.balance ? (
        <ActionButton color='primary' onClick={() => handleBillPay(bill.id)} icon={<PaymentIcon fontSize='small' />} />
      ) : bill.payments && bill.payments.length > 0 ? (
        formatDate(bill.payments[0].transDt)
      ) : (
        ''
      );
    }
    return billAction;
  };

  return (
    <>
      <Table className={classes.table}>
        <TableHead>
          <TableRow className={classes.tableRow}>
            {headers &&
              headers.map((value, idx) => (
                <TableCell key={idx} style={{ ...cellStyle, color: '#E91E63' }}>
                  {value}
                </TableCell>
              ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {billsForPage.map((bill) => (
            <TableRow key={bill.id} className={classes.tableRow} hover={true}>
              <TableCell className={tableCellClasses} style={cellStyle}>
                <ActionButton
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
                {buildBillAction(bill)}
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
        onChangePage={(e, newPage) => setPage(newPage)}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        ActionsComponent={(props) => <PaginationActions {...props} section='bills' total={total} />}
      />
      <BillPayDialog openEdit={openEdit} onEditSave={handleEditSave} onEditCancel={handleEditCancel} />
    </>
  );
};
