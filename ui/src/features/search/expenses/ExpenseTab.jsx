import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import moment from 'moment';

import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';

// @mui/icons-material
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TransformIcon from '@mui/icons-material/Transform';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import KeyboardTabIcon from '@mui/icons-material/KeyboardTab';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import FlagIcon from '@mui/icons-material/Flag';

import { COLOR } from 'app/config';
import { FORMATS } from 'app/constants';

import { ExpenseEditDialog } from 'features/search/expenseEdit/ExpenseEditDialog';
import { formatAmt, formatDate, getTotalAmount } from 'features/utils';
import { filterAndSortExpenses, findTargetTransId } from 'features/search/expenses/expenseUtils';

import { selectDashboardGlobal } from 'features/dashboard/dashboardGlobalSlice';
import { deleteExpense, swapExpenses } from 'features/search/expenses/expenseSlice';
import { editExpense } from 'features/search/expenseEdit/expenseEditSlice';

export const ExpenseTab = ({ expenses, rowsPerPage }) => {
  const dispatch = useDispatch();
  const { accountFilter, billFilter } = useSelector(selectDashboardGlobal);

  const [openEdit, setOpenEdit] = useState(false);

  // TODO - implement custom pagination
  const [paginationModel, setPaginationModel] = useState({
    pageSize: rowsPerPage,
    page: 0,
  });

  useEffect(
    () => {
      setPaginationModel({
        pageSize: rowsPerPage,
        page: 0,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountFilter, billFilter, rowsPerPage]
  );

  const filteredExpenses = useMemo(
    () => filterAndSortExpenses(expenses, accountFilter, billFilter),
    [expenses, accountFilter, billFilter]
  );
  const totalAmt = useMemo(() => getTotalAmount(filteredExpenses), [filteredExpenses]);

  const columnDefs = useMemo(() => {
    const handleMove = (exp, up) => {
      const toId = findTargetTransId(filteredExpenses, exp.id, up);
      if (toId != null) {
        dispatch(swapExpenses({ first: { id: exp.id }, second: { id: toId } }));
      }
    };

    const handleEdit = (exp) => {
      dispatch(editExpense(exp));
      setOpenEdit(true);
    };

    const handleDelete = (exp) => {
      dispatch(deleteExpense(exp.id));
    };

    return [
      {
        field: 'actions',
        type: 'actions',
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 2,
        renderHeader: () => <TouchAppIcon fontSize='small' />,
        getActions: ({ row }) => [
          <GridActionsCellItem
            icon={<EditIcon fontSize='small' />}
            label='Edit'
            color='warning'
            onClick={() => handleEdit(row)}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon fontSize='small' />}
            label='Delete'
            color='error'
            onClick={() => handleDelete(row)}
          />,
          <GridActionsCellItem
            icon={<ArrowUpwardIcon fontSize='small' />}
            label='Move up'
            color='info'
            onClick={() => handleMove(row, true)}
          />,
          <GridActionsCellItem
            icon={<ArrowDownwardIcon fontSize='small' />}
            label='Move down'
            color='info'
            onClick={() => handleMove(row, false)}
          />,
        ],
      },
      {
        field: 'id',
        sortable: false,
        flex: 1,
        type: 'number',
        headerAlign: 'center',
        align: 'center',
        headerName: 'ID',
      },
      {
        field: 'entryDt',
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 2,
        headerName: 'ENTRY DATE',
        valueFormatter: ({ value }) => moment(value, FORMATS.YYYYMMDDHHmmss).format(FORMATS.DDMMMYYYYHHMM),
      },
      {
        field: 'transDt',
        sortable: false,
        flex: 1.2,
        headerAlign: 'center',
        align: 'center',
        headerName: 'TRANS',
        valueFormatter: ({ value }) => formatDate(value, FORMATS.DDMMM),
      },
      {
        field: 'category',
        sortable: false,
        flex: 2.5,
        headerName: 'CATEGORY',
        valueGetter: ({ row }) => (row.category ? row.category.name : '-'),
      },
      {
        field: 'description',
        sortable: false,
        flex: 2.5,
        headerName: 'DESCRIPTION',
      },
      {
        field: 'amount',
        sortable: false,
        flex: 1.5,
        headerName: 'AMOUNT',
        type: 'number',
        valueFormatter: ({ value }) => formatAmt(value, false),
      },
      {
        field: 'fromAc',
        sortable: false,
        flex: 2,
        headerName: 'FROM',
        valueGetter: ({ row }) => (row.accounts.from ? row.accounts.from.name : '-'),
      },
      {
        field: 'fromBf',
        sortable: false,
        flex: 1.5,
        type: 'number',
        renderHeader: () => <TrendingFlatIcon fontSize='small' />,
        valueGetter: ({ row }) => (row.accounts.from ? formatAmt(row.accounts.from.balanceBf, false) : '-'),
      },
      {
        field: 'fromAf',
        sortable: false,
        flex: 1.5,
        type: 'number',
        renderHeader: () => <KeyboardTabIcon fontSize='small' />,
        valueGetter: ({ row }) => (row.accounts.from ? formatAmt(row.accounts.from.balanceAf, false) : '-'),
      },
      {
        field: 'toAc',
        sortable: false,
        flex: 2,
        headerName: 'TO',
        valueGetter: ({ row }) => (row.accounts.to ? row.accounts.to.name : '-'),
      },
      {
        field: 'toBf',
        sortable: false,
        flex: 1.5,
        type: 'number',
        renderHeader: () => <TrendingFlatIcon fontSize='small' />,
        valueGetter: ({ row }) => (row.accounts.to ? formatAmt(row.accounts.to.balanceBf, false) : '-'),
      },
      {
        field: 'toAf',
        sortable: false,
        flex: 1.5,
        type: 'number',
        renderHeader: () => <KeyboardTabIcon fontSize='small' />,
        valueGetter: ({ row }) => (row.accounts.to ? formatAmt(row.accounts.to.balanceAf, false) : '-'),
      },
      {
        field: 'flag',
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 1.5,
        renderHeader: () => <FlagIcon fontSize='small' />,
        renderCell: ({ row }) => {
          return row.adjust ? (
            <TransformIcon fontSize='small' color='primary' />
          ) : row.adhoc ? (
            <ShoppingBasketIcon fontSize='small' color='primary' />
          ) : (
            <></>
          );
        },
      },
    ];
  }, [dispatch, filteredExpenses]);

  return (
    <>
      <DataGrid
        rows={filteredExpenses}
        columns={columnDefs}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[rowsPerPage]}
        disableColumnFilter
        disableColumnMenu
        columnHeaderHeight={45}
        rowHeight={35}
        sx={{
          fontSize: 12,
          '& .MuiDataGrid-columnHeaders': {
            color: COLOR.RED,
            fontWeight: 'normal',
          },
        }}
      />
      <ExpenseEditDialog openEdit={openEdit} setOpenEdit={setOpenEdit} />
    </>
  );
};
