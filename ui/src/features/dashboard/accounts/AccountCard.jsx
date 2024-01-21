import React, { memo, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// @mui material components
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Icon from '@mui/material/Icon';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

// @mui/icons-material
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BlockIcon from '@mui/icons-material/Block';
import BeenhereIcon from '@mui/icons-material/Beenhere';

import { AppIcon } from 'components/app/AppIcon';

import { selectDashboardGlobal, setAccountFilter } from 'features/dashboard/dashboardGlobalSlice';
import { tallyAccount } from 'features/accounts/accountSlice';
import { selectBills } from 'features/dashboard/bills/billTab/billTabSlice';

import { formatAmt } from 'features/utils';
import {
  buildAccountColor,
  buildTallyInfo,
  buildBillInfo,
  buildAccountTallyInfoColor,
  buildAccountBillInfoColor,
  findBill,
} from 'features/dashboard/accounts/accountUtils';

// TODO - create common component, move icons to CONSTANTS
const AccountCardUI = memo(({ account, isSelected, lastBill, openBill }) => {
  const dispatch = useDispatch();

  const handleAccountFilter = (id) => {
    dispatch(setAccountFilter(id));
  };

  const handleTallyClick = (id) => {
    dispatch(tallyAccount(id));
  };

  const acctColor = isSelected ? 'warning' : buildAccountColor(account.color);
  const acctIcon = <AppIcon icon={account.icon} color='white' />;
  const title1 = account.name + ' #' + account.id + '';
  const title2 = formatAmt(account.balance, false);
  const tallyInfoColor = buildAccountTallyInfoColor(account.tallyDt);
  const tallyInfo = buildTallyInfo(account.tallyBalance, account.tallyDt);
  const billInfoColor = buildAccountBillInfoColor(account.billed, lastBill, openBill);
  const billInfoIcon = account.billed ? (
    <AccessTimeIcon fontSize='small' style={{ top: '1px' }} />
  ) : (
    <BlockIcon fontSize='small' style={{ top: '1px' }} />
  );
  const billInfo = buildBillInfo(account.billed, lastBill, openBill);

  return (
    <Card style={{ marginTop: '0px', marginBottom: '0px' }}>
      <MDBox display='flex' justifyContent='space-between' pt={1} px={2}>
        <MDBox
          variant='gradient'
          bgColor={acctColor}
          color={acctColor === 'light' ? 'dark' : 'white'}
          coloredShadow={acctColor}
          borderRadius='xl'
          display='flex'
          justifyContent='center'
          alignItems='center'
          width='4rem'
          height='4rem'
          mt={-2}
          onClick={() => handleAccountFilter(isSelected ? null : account.id)}
          style={{ padding: '7px', cursor: 'pointer' }}
        >
          <Icon fontSize='medium' color='inherit'>
            {acctIcon}
          </Icon>
        </MDBox>
        <MDBox textAlign='right' lineHeight={1.25}>
          <MDTypography variant='button' fontWeight='light' color='text'>
            {title1}
          </MDTypography>
          <MDTypography variant='subtitle2' fontWeight='light'>
            {title2}
          </MDTypography>
        </MDBox>
      </MDBox>
      <Divider style={{ margin: '0.5rem' }} />
      <MDBox pb={1} px={2} display='flex'>
        <Icon fontSize='small' title='Tally' color={tallyInfoColor} onClick={() => handleTallyClick(account.id)}>
          {<BeenhereIcon fontSize='small' style={{ top: '1px', cursor: 'pointer' }} />}
        </Icon>
        <MDTypography component='p' variant='button' fontSize='small' color='secondary' display='flex'>
          &nbsp;&nbsp;{tallyInfo}
        </MDTypography>
      </MDBox>
      <MDBox pb={2} px={2} display='flex'>
        <Icon fontSize='small' color={billInfoColor}>
          {billInfoIcon}
        </Icon>
        <MDTypography component='p' variant='button' fontSize='small' color='secondary' display='flex'>
          &nbsp;&nbsp;{billInfo}
        </MDTypography>
      </MDBox>
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
