import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import _ from 'lodash';

// @material-ui/core components
import { Grid, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

// @material-ui/icons
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import BlockIcon from '@material-ui/icons/Block';
import BeenhereIcon from '@material-ui/icons/Beenhere';

// core components
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardIcon from 'components/Card/CardIcon.js';
import CardFooter from 'components/Card/CardFooter.js';
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js';

import { ActionButton } from 'features/inputs';

import { selectDashboardGlobal, setAccountFilter } from 'features/dashboard/dashboardGlobalSlice';
import { tallyAccount } from 'features/dashboard/accounts/accountSlice';
import { selectBills } from 'features/dashboard/bills/billTab/billTabSlice';

import { formatAmt } from 'features/utils';
import {
  buildAccountIcon,
  buildAccountColor,
  buildTallyInfo,
  buildBillInfo,
  buildAccountTallyInfoColor,
  buildAccountBillInfoColor,
} from 'features/dashboard/accounts/accountUtils';

const useStyles = makeStyles(styles);

export const AccountCard = ({ account }) => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const { accountFilter } = useSelector(selectDashboardGlobal);
  const bills = useSelector(selectBills);

  const lastBill = account.billed && account.bills.last ? _.find(bills, (e) => e.id === account.bills.last.id) : null;
  const openBill = account.billed && account.bills.open ? _.find(bills, (e) => e.id === account.bills.open.id) : null;

  const handleAccountFilter = (id) => {
    dispatch(setAccountFilter(accountFilter === id ? null : id));
  };

  const handleTallyClick = (id) => {
    dispatch(tallyAccount(id));
  };

  return (
    <Card style={{ marginTop: '10px', marginBottom: '0px' }}>
      <CardHeader stats icon>
        <CardIcon
          color={accountFilter === account.id ? 'warning' : buildAccountColor(account.color)}
          onClick={() => handleAccountFilter(account.id)}
          style={{ padding: '7px', cursor: 'pointer' }}
        >
          {buildAccountIcon(account.icon)}
        </CardIcon>
        <p className={classes.cardCategory}>
          <small>
            {account.name} [{account.id}]
          </small>
        </p>
        <h2 className={classes.cardTitle}>{formatAmt(account.balance, false)}</h2>
      </CardHeader>
      <CardFooter stats style={{ textAlign: 'center' }}>
        <Grid container spacing={1} alignItems='center'>
          <Grid container item lg={12} spacing={1} alignItems='center'>
            <Grid item lg={2}>
              <ActionButton
                color={buildAccountTallyInfoColor(account.tallyDt)}
                onClick={() => handleTallyClick(account.id)}
                icon={<BeenhereIcon fontSize='small' style={{ top: '1px' }} />}
              />
            </Grid>
            <Grid item lg={10}>
              <Box fontWeight='fontWeightRegular' fontSize={12} style={{ color: '#999', textAlign: 'left' }}>
                {buildTallyInfo(account.tallyBalance, account.tallyDt)}
              </Box>
            </Grid>
          </Grid>
          <Grid container item lg={12} spacing={1} alignItems='center'>
            <Grid item lg={2}>
              <ActionButton
                disabled
                color={buildAccountBillInfoColor(account.billed, lastBill, openBill)}
                icon={
                  account.billed ? (
                    <AccessTimeIcon fontSize='small' style={{ top: '1px' }} />
                  ) : (
                    <BlockIcon fontSize='small' style={{ top: '1px' }} />
                  )
                }
              />
            </Grid>
            <Grid item lg={10}>
              <Box fontWeight='fontWeightRegular' fontSize={12} style={{ color: '#999', textAlign: 'left' }}>
                {buildBillInfo(account.billed, lastBill, openBill)}
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </CardFooter>
    </Card>
  );
};
