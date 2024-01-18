import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { AppSection } from 'components/app/AppSection';

import { BILLS_TAB, ICONS } from 'app/constants';
import { BillTab } from 'features/dashboard/bills/billTab/BillTab';
import { hasBillsToClose, hasBillsToPay } from 'features/dashboard/bills/billUtils';

import { selectBills } from 'features/dashboard/bills/billTab/billTabSlice';

export const BillSection = () => {
  const bills = useSelector(selectBills);

  const billsToPay = useMemo(() => hasBillsToPay(bills), [bills]);
  const billsToClose = useMemo(() => hasBillsToClose(bills), [bills]);

  return (
    <AppSection
      title='BILLS'
      headerColor='primary'
      tabs={[
        {
          tabName: BILLS_TAB.UNPAID,
          tabIcon: ICONS.NotificationsActiveIcon,
          tabContent: <BillTab closed paid={false} />,
          badge: billsToPay,
        },
        {
          tabName: BILLS_TAB.PAID,
          tabIcon: ICONS.HistoryIcon,
          tabContent: <BillTab closed paid />,
          badge: false,
        },
        {
          tabName: BILLS_TAB.OPEN,
          tabIcon: ICONS.DonutLargeIcon,
          tabContent: <BillTab closed={false} />,
          badge: billsToClose,
        },
      ]}
    />
  );
};
