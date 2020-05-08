import React from 'react';

// @material-ui/icons
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import TransformIcon from '@material-ui/icons/Transform';

import Tabs from 'components/CustomTabs/CustomTabs.js';

import { EntryTab } from 'features/dashboard/entry/EntryTab';

export const EntrySection = () => {
  return (
    <Tabs
      title='ADD'
      headerColor='success'
      tabs={[
        {
          tabName: 'EXPENSE',
          tabIcon: AddShoppingCartIcon,
          tabContent: <EntryTab adjust={false} />,
        },
        {
          tabName: 'ADJUSTMENT',
          tabIcon: TransformIcon,
          tabContent: <EntryTab adjust />,
        },
      ]}
    />
  );
};
