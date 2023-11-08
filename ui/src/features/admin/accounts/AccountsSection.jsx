import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import classnames from 'classnames';

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
import TouchAppIcon from '@material-ui/icons/TouchApp';

import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js';
import taskStyles from 'assets/jss/material-dashboard-react/components/tasksStyle.js';

import { COLOR } from 'app/config';
import { PAGINATION_BLOCK } from 'app/constants';
import { ActionButton } from 'features/inputs';
import { CustomPagination, PaginationActions } from 'features/inputs/pagination';
import { formatAmt, getSliceForPage } from 'features/utils';

import { sortAccounts } from 'features/accounts/accountUtils';
import { modifyAccount, selectAccounts, deleteAccount } from 'features/accounts/accountSlice';

const headers = [
  <TouchAppIcon style={{ fontSize: 18 }} />,
  'ID',
  'NAME',
  'CASH',
  'BILLED',
  'ACTIVE',
  'ICON',
  'COLOR',
  'SEQ',
  'CLOSING DAY',
  'DUE DAY',
  'BALANCE',
];
const cellStyleDefault = { textAlign: 'center', padding: '5px 8px', fontSize: 12 };
const useStyles = makeStyles(styles);
const useTaskStyles = makeStyles(taskStyles);

export const AccountsSection = ({ rowsPerPage, setRowsPerPage }) => {
  const classes = useStyles();
  const taskClasses = useTaskStyles();
  const tableCellClasses = classnames(taskClasses.tableCell);

  const dispatch = useDispatch();

  const { allAccounts, loading } = useSelector(selectAccounts);

  const [page, setPage] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);

  const acctsSorted = sortAccounts(allAccounts);
  const accountsForPage = getSliceForPage(acctsSorted, page, rowsPerPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (acct) => {
    dispatch(modifyAccount(acct));
    setOpenEdit(true);
  };

  const handleDelete = (acct) => {
    dispatch(deleteAccount(acct.id));
  };

  return (
    <>
      <Card style={{ marginBottom: '10px' }}>
        <CardHeader color='info'>
          <GridContainer>
            <GridItem xs={12} sm={12} md={11}>
              <h4 className={classes.cardTitleWhite}>ACCOUNTS</h4>
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
              {accountsForPage.map((acct) => {
                const cellStyle = cellStyleDefault;
                return (
                  <TableRow key={acct.id} className={classes.tableRow} hover>
                    <TableCell className={tableCellClasses} style={cellStyle} width='10%'>
                      <ActionButton
                        title='Edit'
                        color='warning'
                        onClick={() => handleEdit(acct)}
                        icon={<EditIcon fontSize='small' />}
                      />
                      <ActionButton
                        title='Delete'
                        color='rose'
                        onClick={() => handleDelete(acct)}
                        icon={<DeleteIcon fontSize='small' />}
                      />
                    </TableCell>
                    <TableCell className={tableCellClasses} style={cellStyle}>
                      {acct.id}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={cellStyle}>
                      {acct.name}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={cellStyle}>
                      {acct.cash ? 'Y' : ''}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={cellStyle}>
                      {acct.billed ? 'Y' : ''}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={cellStyle}>
                      {acct.active ? 'Y' : ''}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={cellStyle}>
                      {acct.icon}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={cellStyle}>
                      {acct.color}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={cellStyle}>
                      {acct.seq}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={cellStyle}>
                      {acct.closingDay}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={cellStyle}>
                      {acct.dueDay}
                    </TableCell>
                    <TableCell className={tableCellClasses} style={{ ...cellStyle, textAlign: 'right' }}>
                      {formatAmt(acct.balance, false)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <CustomPagination
            component='div'
            rowsPerPageOptions={[rowsPerPage]}
            count={acctsSorted.length}
            rowsPerPage={rowsPerPage}
            page={rowsPerPage >= acctsSorted.length ? 0 : page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={(props) => (
              <PaginationActions {...props} section={PAGINATION_BLOCK.ACCOUNTS} totalAmt={0} />
            )}
          />
        </CardBody>
      </Card>
    </>
  );
};
