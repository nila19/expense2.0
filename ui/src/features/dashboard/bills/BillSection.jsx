import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

// @mui/icons-material
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import HistoryIcon from '@mui/icons-material/History';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';

import Tabs from 'components/CustomTabs/CustomTabs.js';

import { BILLS_TAB } from 'app/constants';
import { BillTab } from 'features/dashboard/bills/billTab/BillTab';
import { hasBillsToClose, hasBillsToPay } from 'features/dashboard/bills/billUtils';

import { selectBills } from 'features/dashboard/bills/billTab/billTabSlice';

export const BillSection = () => {
  const bills = useSelector(selectBills);

  const billsToPay = useMemo(() => hasBillsToPay(bills), [bills]);
  const billsToClose = useMemo(() => hasBillsToClose(bills), [bills]);

  return (
    <Tabs
      title='BILLS'
      headerColor='primary'
      tabs={[
        {
          tabName: BILLS_TAB.UNPAID,
          tabIcon: NotificationsActiveIcon,
          tabContent: <BillTab closed paid={false} />,
          badge: billsToPay,
        },
        {
          tabName: BILLS_TAB.PAID,
          tabIcon: HistoryIcon,
          tabContent: <BillTab closed paid />,
          badge: false,
        },
        {
          tabName: BILLS_TAB.OPEN,
          tabIcon: DonutLargeIcon,
          tabContent: <BillTab closed={false} />,
          badge: billsToClose,
        },
      ]}
    />
  );
};
