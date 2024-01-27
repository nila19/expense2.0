import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import _ from 'lodash';
import moment from 'moment';
import memoize from 'memoize-one';

import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';

import { AppPagination } from 'components/app/AppPagination';

import { COLOR } from 'app/config';
import { FORMATS } from 'app/constants';
import { AppIcon } from 'components/app/AppIcon';

import { ExpenseEditDialog } from 'features/search/expenseEdit/ExpenseEditDialog';
import { formatAmt, formatDate, getTotalAmount } from 'features/utils';
import { filterAndSortExpenses, findTargetTransId } from 'features/search/expenses/expenseUtils';

import { selectDashboardGlobal } from 'features/dashboard/dashboardGlobalSlice';
import { selectStartupData } from 'features/startup/startupSlice';
import { deleteExpense, swapExpenses } from 'features/search/expenses/expenseSlice';
import { editExpense } from 'features/search/expenseEdit/expenseEditSlice';

export const ExpensesTab = ({ expenses, rowsPerPage }) => {
  const dispatch = useDispatch();
  const { accountFilter, billFilter } = useSelector(selectDashboardGlobal);
  const { categories } = useSelector(selectStartupData);

  const [openEdit, setOpenEdit] = useState(false);

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
  const filterApplied = accountFilter || billFilter;

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

    const getCategoryIcon = memoize((id) => {
      const category = _.find(categories, { id: id });
      return category?.icon;
    });

    return [
      {
        field: 'actions',
        type: 'actions',
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 2,
        renderHeader: () => <AppIcon icon='TouchAppIcon' color='error' />,
        getActions: ({ row }) => [
          <GridActionsCellItem
            icon={<AppIcon icon='EditIcon' color='warning' />}
            label='Edit'
            onClick={() => handleEdit(row)}
          />,
          <GridActionsCellItem
            icon={<AppIcon icon='DeleteIcon' color='error' />}
            label='Delete'
            onClick={() => handleDelete(row)}
          />,
          <GridActionsCellItem
            icon={<AppIcon icon='ArrowUpwardIcon' color='info' />}
            label='Move up'
            onClick={() => handleMove(row, true)}
          />,
          <GridActionsCellItem
            icon={<AppIcon icon='ArrowDownwardIcon' color='info' />}
            label='Move down'
            onClick={() => handleMove(row, false)}
          />,
        ],
      },
      {
        field: 'id',
        sortable: false,
        flex: 1,
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
        flex: 1.5,
        headerAlign: 'center',
        align: 'center',
        headerName: 'TRANS',
        valueFormatter: ({ value }) => formatDate(value),
      },
      {
        field: 'categoryIcon',
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 0.5,
        renderHeader: () => <AppIcon icon='FlagIcon' color='error' />,
        renderCell: ({ row }) => {
          return row.category?.id ? <AppIcon icon={getCategoryIcon(row.category.id)} /> : <></>;
        },
      },
      {
        field: 'category',
        sortable: false,
        flex: 2,
        headerName: 'CATEGORY',
        valueGetter: ({ row }) => (row.category?.id ? row.category.name : '-'),
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
        flex: 1.5,
        headerName: 'FROM',
        valueGetter: ({ row }) => (row.accounts.from?.id ? row.accounts.from.name : '-'),
      },
      {
        field: 'fromBf',
        sortable: false,
        flex: 1.5,
        type: 'number',
        renderHeader: () => <AppIcon icon='TrendingFlatIcon' color='error' />,
        valueGetter: ({ row }) => (row.accounts.from?.id ? formatAmt(row.accounts.from.balanceBf, false) : '-'),
      },
      {
        field: 'fromAf',
        sortable: false,
        flex: 1.5,
        type: 'number',
        renderHeader: () => <AppIcon icon='KeyboardTabIcon' color='error' />,
        valueGetter: ({ row }) => (row.accounts.from?.id ? formatAmt(row.accounts.from.balanceAf, false) : '-'),
      },
      {
        field: 'toAc',
        sortable: false,
        flex: 1.5,
        headerName: 'TO',
        valueGetter: ({ row }) => (row.accounts.to?.id ? row.accounts.to.name : '-'),
      },
      {
        field: 'toBf',
        sortable: false,
        flex: 1.5,
        type: 'number',
        renderHeader: () => <AppIcon icon='TrendingFlatIcon' color='error' />,
        valueGetter: ({ row }) => (row.accounts.to?.id ? formatAmt(row.accounts.to.balanceBf, false) : '-'),
      },
      {
        field: 'toAf',
        sortable: false,
        flex: 1.5,
        type: 'number',
        renderHeader: () => <AppIcon icon='KeyboardTabIcon' color='error' />,
        valueGetter: ({ row }) => (row.accounts.to?.id ? formatAmt(row.accounts.to.balanceAf, false) : '-'),
      },
      {
        field: 'flag',
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 1.5,
        renderHeader: () => <AppIcon icon='FlagIcon' color='error' />,
        renderCell: ({ row }) => {
          return row.adjust || row.adhoc ? (
            <AppIcon icon={row.adjust ? 'TransformIcon' : 'ShoppingBasketIcon'} />
          ) : (
            <></>
          );
        },
      },
    ];
  }, [dispatch, filteredExpenses, categories]);

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
        slots={{
          pagination: AppPagination,
        }}
        slotProps={{
          pagination: { totalAmt, filterApplied },
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
      <ExpenseEditDialog openEdit={openEdit} setOpenEdit={setOpenEdit} />
    </>
  );
};
