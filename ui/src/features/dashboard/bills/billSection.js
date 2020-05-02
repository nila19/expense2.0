import React from 'react';

// @material-ui/icons
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import HistoryIcon from '@material-ui/icons/History';

import Tabs from 'components/CustomTabs/CustomTabs.js';

import { BillTab } from 'features/dashboard/bills/billTab/billTab';

export const BillSection = () => {
  return (
    <Tabs
      title='BILLS'
      headerColor='primary'
      tabs={[
        {
          tabName: 'UNPAID',
          tabIcon: NotificationsActiveIcon,
          tabContent: <BillTab paid={false} />,
        },
        {
          tabName: 'PAID',
          tabIcon: HistoryIcon,
          tabContent: <BillTab paid={true} />,
        },
      ]}
    />
  );
};
