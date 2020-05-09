import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';

// @material-ui/icons
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import TransformIcon from '@material-ui/icons/Transform';

import Tabs from 'components/CustomTabs/CustomTabs.js';

import { ENTRY_TAB } from 'app/constants';
import { EntryTab } from 'features/dashboard/entry/EntryTab';
import { buildCategoriesOptions, buildAccountOptions } from 'features/utils';

import { selectStartupData } from 'features/startup/startupSlice';
import { selectAccounts } from 'features/dashboard/accounts/accountSlice';

export const EntrySection = memo(() => {
  const { categories, descriptions } = useSelector(selectStartupData);
  const accounts = useSelector(selectAccounts);

  const accountOptions = useMemo(() => buildAccountOptions(accounts), [accounts]);
  const categoriesOptions = useMemo(() => buildCategoriesOptions(categories), [categories]);

  const options = { descriptions, categories, accountOptions, categoriesOptions };
  console.log('Rendering Entry Section.. ');

  return (
    <Tabs
      title='ADD'
      headerColor='success'
      tabs={[
        {
          tabName: ENTRY_TAB.EXPENSE,
          tabIcon: AddShoppingCartIcon,
          tabContent: <EntryTab adjust={false} {...options} />,
        },
        {
          tabName: ENTRY_TAB.ADJUSTMENT,
          tabIcon: TransformIcon,
          tabContent: <EntryTab adjust {...options} />,
        },
      ]}
    />
  );
});
