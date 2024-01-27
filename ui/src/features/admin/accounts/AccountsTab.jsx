import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';

import { Grid } from '@mui/material';

import { COUNTS, COLOR } from 'app/config';
import { formatAmt } from 'features/utils';

import { AppIcon } from 'components/app/AppIcon';

import { sortAccounts } from 'features/accounts/accountUtils';
import { buildAccountColor } from 'features/dashboard/accounts/accountUtils';
import { AccountEditDialog } from 'features/admin/accountEdit/AccountEditDialog';

import { selectAccounts, deleteAccount } from 'features/accounts/accountsSlice';
import { editAccount } from 'features/accounts/accountEditSlice';

export const AccountsTab = () => {
  const dispatch = useDispatch();

  const [openEdit, setOpenEdit] = useState(false);

  const { allAccounts } = useSelector(selectAccounts);

  const acctsSorted = sortAccounts(allAccounts);

  const rowsPerPage = COUNTS.ADMIN_ACCOUNTS;

  // TODO - implement custom pagination
  const [paginationModel, setPaginationModel] = useState({
    pageSize: rowsPerPage,
    page: 0,
  });

  const columnDefs = useMemo(() => {
    const handleEdit = (acct) => {
      dispatch(editAccount(acct));
      setOpenEdit(true);
    };

    const handleDelete = (acct) => {
      dispatch(deleteAccount(acct.id));
    };

    return [
      {
        field: 'actions',
        type: 'actions',
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 1,
        renderHeader: () => <AppIcon icon='TouchAppIcon' color='error' />,
        getActions: ({ row }) => [
          <GridActionsCellItem
            icon={<AppIcon icon='EditIcon' color='warning' />}
            label='Edit'
            color='warning'
            onClick={() => handleEdit(row)}
          />,
          <GridActionsCellItem
            icon={<AppIcon icon='DeleteIcon' color='error' />}
            label='Delete'
            color='error'
            onClick={() => handleDelete(row)}
          />,
        ],
      },
      {
        field: 'id',
        sortable: false,
        flex: 0.5,
        type: 'number',
        headerAlign: 'center',
        align: 'center',
        headerName: 'ID',
      },
      {
        field: 'name',
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 2,
        headerName: 'NAME',
      },
      {
        field: 'cash',
        sortable: true,
        headerAlign: 'center',
        align: 'center',
        flex: 0.5,
        headerName: 'CASH',
        renderCell: ({ value }) => {
          return value ? <AppIcon icon={'yes'} /> : '';
        },
      },
      {
        field: 'billed',
        sortable: true,
        headerAlign: 'center',
        align: 'center',
        flex: 0.5,
        headerName: 'BILLED',
        renderCell: ({ value }) => {
          return value ? <AppIcon icon={'yes'} /> : '';
        },
      },
      {
        field: 'active',
        sortable: true,
        headerAlign: 'center',
        align: 'center',
        flex: 0.5,
        headerName: 'ACTIVE',
        renderCell: ({ value }) => {
          return value ? <AppIcon icon={'yes'} /> : <AppIcon icon={'no'} color='error' />;
        },
      },
      {
        field: 'icon',
        sortable: true,
        headerAlign: 'center',
        align: 'left',
        flex: 1.5,
        headerName: 'ICON',
        renderCell: ({ row }) => {
          return (
            <Grid container alignItems='center' justifyContent='center'>
              <Grid item xs={12} sm={2}>
                <AppIcon icon={row.icon} color={buildAccountColor(row.color)} />
              </Grid>
              <Grid item xs={12} sm={10}>
                {row.icon}
              </Grid>
            </Grid>
          );
        },
      },
      {
        field: 'seq',
        sortable: true,
        headerAlign: 'center',
        align: 'center',
        flex: 0.5,
        headerName: 'SEQ',
      },
      {
        field: 'closingDay',
        sortable: false,
        headerAlign: 'center',
        flex: 0.5,
        type: 'number',
        headerName: 'CLOSING DAY',
        valueGetter: ({ row }) => (row.billed ? row.closingDay : ''),
      },
      {
        field: 'dueDay',
        sortable: false,
        headerAlign: 'center',
        flex: 0.5,
        type: 'number',
        headerName: 'DUE DAY',
        valueGetter: ({ row }) => (row.billed ? row.dueDay : ''),
      },
      {
        field: 'balance',
        sortable: true,
        headerAlign: 'center',
        flex: 1,
        type: 'number',
        headerName: 'BALANCE',
        valueFormatter: ({ value }) => formatAmt(value, true),
      },
    ];
  }, [dispatch]);

  return (
    <>
      <DataGrid
        rows={acctsSorted}
        columns={columnDefs}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[rowsPerPage]}
        disableColumnSelector
        columnHeaderHeight={45}
        rowHeight={35}
        getRowClassName={({ row }) => {
          if (!row.active) {
            return 'accounts-closed';
          }
        }}
        sx={{
          fontSize: 12,
          '& .MuiDataGrid-columnHeaders': {
            color: COLOR.RED,
            fontWeight: 'normal',
          },
          '& .accounts-closed': {
            backgroundColor: COLOR.GREY,
          },
        }}
      />
      <AccountEditDialog openEdit={openEdit} setOpenEdit={setOpenEdit} />
    </>
  );
};
