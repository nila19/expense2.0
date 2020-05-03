import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import numeral from 'numeral';

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

import { ActionButton } from 'features/inputs/formFields';

import { selectDashboardGlobal, setAccountFilter } from 'features/dashboard/dashboardGlobalSlice';
import { tallyAccount, billAccount } from 'features/dashboard/accounts/accountsSlice';

import { format } from 'features/utils';
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

  const handleAccountFilter = (id) => {
    dispatch(setAccountFilter(accountFilter === id ? null : id));
  };

  const handleTallyClick = (id) => {
    dispatch(tallyAccount(id));
  };

  const handleBillClick = (id) => {
    dispatch(billAccount(id));
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
          <small>{account.name}</small>
        </p>
        <h2 className={classes.cardTitle}>{numeral(account.balance).format(format.AMOUNT)}</h2>
      </CardHeader>
      <CardFooter stats style={{ textAlign: 'center' }}>
        <Grid container spacing={1} alignItems='center'>
          <Grid container item lg={12} spacing={1} alignItems='center'>
            <Grid item lg={2}>
              <ActionButton
                color={buildAccountTallyInfoColor(account)}
                onClick={() => handleTallyClick(account.id)}
                icon={<BeenhereIcon fontSize='small' style={{ top: '1px' }} />}
              />
            </Grid>
            <Grid item lg={10}>
              <Box fontWeight='fontWeightRegular' fontSize={12} style={{ color: '#999', textAlign: 'left' }}>
                {buildTallyInfo(account)}
              </Box>
            </Grid>
          </Grid>
          <Grid container item lg={12} spacing={1} alignItems='center'>
            <Grid item lg={2}>
              <ActionButton
                color={buildAccountBillInfoColor(account)}
                {...(account.billed && account.bills.last.balance <= 0 ? {} : { disabled: true })}
                onClick={() => handleBillClick(account.id)}
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
                {buildBillInfo(account)}
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </CardFooter>
    </Card>
  );
};
