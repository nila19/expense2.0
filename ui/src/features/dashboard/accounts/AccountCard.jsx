import React, { memo, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Card, Divider, Icon, Tooltip } from '@mui/material';

import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

import { AppIcon } from 'components/app/AppIcon';

import { selectDashboardGlobal, setAccountFilter } from 'features/dashboard/dashboardGlobalSlice';
import { tallyAccount } from 'features/accounts/accountsSlice';
import { selectBills } from 'features/dashboard/bills/billTab/billTabSlice';

import { formatAmt } from 'features/utils';
import {
  buildAccountColor,
  buildTallyInfo,
  buildBillInfo,
  buildTallyInfoColor,
  buildBillInfoColor,
  findBill,
} from 'features/dashboard/accounts/accountUtils';

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
  const tallyInfoColor = buildTallyInfoColor(account.tallyDt);
  const tallyInfo = buildTallyInfo(account.tallyBalance, account.tallyDt);

  const billed = account.billed && openBill;
  const hasLastBill = lastBill && lastBill.balance > 0;

  const openBillColor = buildBillInfoColor(billed, false);
  const openBillInfo = buildBillInfo(billed, false, lastBill, openBill);

  const lastBillColor = buildBillInfoColor(billed, hasLastBill);
  const lastBillInfo = buildBillInfo(billed, hasLastBill, lastBill, openBill);

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
        <Tooltip title='Tally' placement='top'>
          <Icon fontSize='small' title='Tally' onClick={() => handleTallyClick(account.id)}>
            {<AppIcon icon='BeenhereIcon' color={tallyInfoColor} clickable />}
          </Icon>
        </Tooltip>
        <MDTypography
          component='p'
          variant='button'
          fontSize='small'
          color='secondary'
          display='flex'
          style={{ paddingLeft: '3px' }}
        >
          {tallyInfo}
        </MDTypography>
      </MDBox>
      <MDBox pb={2} px={2} display='flex'>
        <Icon fontSize='small' color={openBillColor}>
          <AppIcon icon={billed ? 'AccessTimeIcon' : 'BlockIcon'} color={openBillColor} />
        </Icon>
        <MDTypography
          component='p'
          variant='button'
          fontSize='small'
          color='secondary'
          display='flex'
          style={{ paddingLeft: '3px', paddingRight: '6px' }}
        >
          {openBillInfo}
        </MDTypography>
        {billed && hasLastBill && (
          <>
            <Icon fontSize='small' color={lastBillColor}>
              <AppIcon icon='AccessTimeIcon' color={lastBillColor} />
            </Icon>
            <MDTypography
              component='p'
              variant='button'
              fontSize='small'
              color='secondary'
              display='flex'
              style={{ paddingLeft: '3px' }}
            >
              {lastBillInfo}
            </MDTypography>
          </>
        )}
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
