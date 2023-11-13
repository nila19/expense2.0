import React, { memo, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// @mui/material components
import { Grid, Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

// @mui/icons-material
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BlockIcon from '@mui/icons-material/Block';
import BeenhereIcon from '@mui/icons-material/Beenhere';

// core components
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardIcon from 'components/Card/CardIcon.js';
import CardFooter from 'components/Card/CardFooter.js';
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js';

import { COLOR } from 'app/config';
import { ActionButton } from 'features/inputs';

import { selectDashboardGlobal, setAccountFilter } from 'features/dashboard/dashboardGlobalSlice';
import { tallyAccount } from 'features/accounts/accountSlice';
import { selectBills } from 'features/dashboard/bills/billTab/billTabSlice';

import { formatAmt } from 'features/utils';
import {
  buildAccountIcon,
  buildAccountColor,
  buildTallyInfo,
  buildBillInfo,
  buildAccountTallyInfoColor,
  buildAccountBillInfoColor,
  findBill,
} from 'features/dashboard/accounts/accountUtils';

const useStyles = makeStyles(styles);

const AccountCardUI = memo(({ account, isSelected, lastBill, openBill }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const handleAccountFilter = (id) => {
    dispatch(setAccountFilter(id));
  };

  const handleTallyClick = (id) => {
    dispatch(tallyAccount(id));
  };

  return (
    <Card style={{ marginTop: '10px', marginBottom: '0px' }}>
      <CardHeader stats icon>
        <CardIcon
          color={isSelected ? 'warning' : buildAccountColor(account.color)}
          onClick={() => handleAccountFilter(isSelected ? null : account.id)}
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
                title='Tally'
                color={buildAccountTallyInfoColor(account.tallyDt)}
                onClick={() => handleTallyClick(account.id)}
                icon={<BeenhereIcon fontSize='small' style={{ top: '1px' }} />}
              />
            </Grid>
            <Grid item lg={10}>
              <Box fontWeight='fontWeightRegular' fontSize={12} style={{ color: COLOR.GREY, textAlign: 'left' }}>
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
              <Box fontWeight='fontWeightRegular' fontSize={12} style={{ color: COLOR.GREY, textAlign: 'left' }}>
                {buildBillInfo(account.billed, lastBill, openBill)}
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </CardFooter>
    </Card>
  );
});

export const AccountCard = memo(({ account }) => {
  const { accountFilter } = useSelector(selectDashboardGlobal);
  const bills = useSelector(selectBills);

  const lastBill = useMemo(() => findBill(bills, account, 'bills.last.id'), [account, bills]);
  const openBill = useMemo(() => findBill(bills, account, 'bills.open.id'), [account, bills]);
  const isSelected = accountFilter === account.id;

  return <AccountCardUI account={account} isSelected={isSelected} lastBill={lastBill} openBill={openBill} />;
});
