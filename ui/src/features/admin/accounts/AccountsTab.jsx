import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';

import { Box } from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TouchAppIcon from '@mui/icons-material/TouchApp';

import { COUNTS, COLOR } from 'app/config';
import { formatAmt } from 'features/utils';

import { AppIcon } from 'components/app/AppIcon';

import { sortAccounts } from 'features/accounts/accountUtils';
import { modifyAccount, selectAccounts, deleteAccount } from 'features/accounts/accountSlice';
import { buildAccountColor } from 'features/dashboard/accounts/accountUtils';

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
      dispatch(modifyAccount(acct));
      setOpenEdit(true);
    };

    const handleDelete = (acct) => {
      dispatch(deleteAccount(acct.id));
    };

    const getFlagIcon = (flag) => {};

    return [
      {
        field: 'actions',
        type: 'actions',
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        flex: 1,
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
        flex: 1,
        headerName: 'ICON',
        renderCell: ({ row }) => {
          return (
            <Box display='flex' justifyContent='center' alignItems='center'>
              <AppIcon icon={row.icon} color={buildAccountColor(row.color)} /> {row.icon}
            </Box>
          );
        },
      },
      // {
      //   field: 'color',
      //   sortable: false,
      //   headerAlign: 'center',
      //   align: 'center',
      //   flex: 0.5,
      //   headerName: 'COLOR',
      //   renderCell: ({ value }) => {
      //     return <AppIcon icon='rectangle' color={buildAccountColor(value)} />;
      //   },
      // },
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
      },
      {
        field: 'dueDay',
        sortable: false,
        headerAlign: 'center',
        flex: 0.5,
        type: 'number',
        headerName: 'DUE DAY',
      },
      {
        field: 'balance',
        sortable: true,
        headerAlign: 'center',
        flex: 1,
        type: 'number',
        headerName: 'BALANCE',
        valueFormatter: ({ value }) => formatAmt(value, false),
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
        // slots={{ columnMenuColumnsItem: null }}
        // disableColumnFilter
        // disableColumnMenu
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
    </>
  );
};
