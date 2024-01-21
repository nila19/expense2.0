import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import moment from 'moment';

import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';

// @mui/icons-material
import PaymentIcon from '@mui/icons-material/Payment';
import DehazeIcon from '@mui/icons-material/Dehaze';
import FilterTiltShiftIcon from '@mui/icons-material/FilterTiltShift';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

import { AppPagination } from 'components/app/AppPagination';

import { COUNTS, COLOR } from 'app/config';

import { BillPayDialog } from 'features/dashboard/bills/billPay/BillPayDialog';
import { formatAmt, formatDate, getTotalBillBalance } from 'features/utils';
import { filterAndSortBills } from 'features/dashboard/bills/billUtils';

import { selectDashboardGlobal, setBillFilter } from 'features/dashboard/dashboardGlobalSlice';
import { selectBills, closeBill } from 'features/dashboard/bills/billTab/billTabSlice';
import { payBill } from 'features/dashboard/bills/billPay/billPaySlice';

const buildBillActions = (bill, dispatch, setOpenEdit) => {
  const handleBillClose = (id) => {
    dispatch(closeBill(id));
  };

  const handleBillPay = (bill) => {
    dispatch(payBill(bill));
    setOpenEdit(true);
  };

  const actions = [];

  // if bill is not closed & billDt is in the past, display CloseBill button
  if (!bill.closed && moment().isAfter(bill.billDt, 'day')) {
    actions.push(
      <GridActionsCellItem
        icon={<FilterTiltShiftIcon fontSize='small' />}
        label='Close Bill'
        color='primary'
        onClick={() => handleBillClose(bill.id)}
      />
    );
  }

  // if bill is closed & has a balance, display PayBill button
  if (bill.closed && bill.balance > 0) {
    actions.push(
      <GridActionsCellItem
        icon={<PaymentIcon fontSize='small' />}
        label='Pay Bill'
        color='primary'
        onClick={() => handleBillPay(bill)}
      />
    );
  }

  return actions;
};

const getPaidDate = (bill) => {
  // if bill is closed & has a payment, display paid date.
  if (bill.closed && bill.payments && bill.payments.length > 0) {
    return bill.payments[0].transDt;
  }
  return null;
};

const buildColVisibilityModel = (paid, closed) => {
  const paidDt = paid === true && closed === true;
  return {
    paidDt: paidDt,
    payment: !paidDt,
  };
};

export const BillTab = ({ paid, closed }) => {
  const dispatch = useDispatch();
  const { accountFilter, billFilter } = useSelector(selectDashboardGlobal);
  const bills = useSelector(selectBills);

  const [page, setPage] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);

  const [paginationModel, setPaginationModel] = useState({
    pageSize: COUNTS.DASHBOARD_BILLS,
    page: 0,
  });

  useEffect(
    () => {
      if (page !== 0) {
        setPage(0);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountFilter]
  );

  const filteredBills = useMemo(
    () => filterAndSortBills(bills, closed, paid, accountFilter),
    [bills, closed, paid, accountFilter]
  );
  const totalAmt = useMemo(() => getTotalBillBalance(filteredBills), [filteredBills]);

  const columnDefs = useMemo(() => {
    const handleBillFilter = (id) => {
      dispatch(setBillFilter(billFilter === id ? null : id));
    };

    return [
      {
        field: 'selection',
        type: 'actions',
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        renderHeader: () => <MenuOpenIcon fontSize='small' />,
        getActions: ({ row }) => [
          <GridActionsCellItem
            icon={<DehazeIcon fontSize='small' />}
            label='Filter Expenses'
            color={row.id === billFilter ? 'warning' : 'primary'}
            onClick={() => handleBillFilter(row.id)}
          />,
        ],
      },
      { field: 'id', sortable: false, width: 100, headerName: 'ID' },
      {
        field: 'acctName',
        sortable: false,
        align: 'left',
        flex: 2,
        headerName: 'ACCOUNT',
        valueGetter: ({ row }) => row.account.name,
      },
      {
        field: 'billDt',
        sortable: false,
        flex: 1.5,
        headerName: 'BILL DATE',
        valueFormatter: ({ value }) => formatDate(value),
      },
      {
        field: 'dueDt',
        sortable: false,
        flex: 1.5,
        headerName: 'DUE DATE',
        valueFormatter: ({ value }) => formatDate(value),
      },
      {
        field: 'amount',
        sortable: false,
        flex: 1.5,
        headerName: 'BILL AMT',
        type: 'number',
        valueFormatter: ({ value }) => formatAmt(value, true),
      },
      {
        field: 'balance',
        sortable: false,
        flex: 1.5,
        headerName: 'BALANCE',
        type: 'number',
        valueFormatter: ({ value }) => formatAmt(value, true),
      },
      {
        field: 'paidDt',
        sortable: false,
        flex: 1.5,
        headerName: 'PAID DATE',
        valueGetter: ({ row }) => getPaidDate(row),
        valueFormatter: ({ value }) => formatDate(value),
      },
      {
        field: 'payment',
        type: 'actions',
        sortable: false,
        headerAlign: 'center',
        flex: 1.5,
        renderHeader: () => <TouchAppIcon fontSize='small' />,
        getActions: ({ row }) => buildBillActions(row, dispatch, setOpenEdit),
      },
    ];
  }, [billFilter, dispatch, setOpenEdit]);

  const colVisibilityModel = buildColVisibilityModel(paid, closed);

  return (
    <>
      <DataGrid
        rows={filteredBills}
        columns={columnDefs}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[COUNTS.DASHBOARD_BILLS]}
        columnVisibilityModel={colVisibilityModel}
        disableColumnFilter
        disableColumnMenu
        columnHeaderHeight={45}
        rowHeight={35}
        slots={{
          pagination: AppPagination,
        }}
        slotProps={{
          pagination: { totalAmt },
        }}
        sx={{
          fontSize: 12,
          '& .MuiDataGrid-columnHeaders': {
            color: COLOR.RED,
            fontWeight: 'normal',
          },
          '& .MuiTablePagination-displayedRows': {
            color: COLOR.RED,
            fontSize: '0.9rem',
            fontWeight: 'normal',
          },
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      />
      <BillPayDialog openEdit={openEdit} setOpenEdit={setOpenEdit} />
    </>
  );
};
