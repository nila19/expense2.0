import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { AppSection } from 'components/app/AppSection';

import { ENTRY_TAB, ICONS } from 'app/constants';
import { EntryTab } from 'features/dashboard/entry/EntryTab';
import { buildCategoriesOptions, buildAccountOptions } from 'features/utils';

import { selectStartupData } from 'features/startup/startupSlice';
import { selectAccounts } from 'features/accounts/accountSlice';

export const EntrySection = memo(() => {
  const { categories, descriptions } = useSelector(selectStartupData);
  const { accounts } = useSelector(selectAccounts);

  const accountOptions = useMemo(() => buildAccountOptions(accounts), [accounts]);
  const categoriesOptions = useMemo(() => buildCategoriesOptions(categories), [categories]);

  const options = { descriptions, categories, accountOptions, categoriesOptions };

  return (
    <AppSection
      title='ADD'
      headerColor='success'
      tabs={[
        {
          tabName: ENTRY_TAB.EXPENSE,
          tabIcon: ICONS.AddShoppingCartIcon,
          tabContent: <EntryTab adjust={false} {...options} />,
          badge: false,
        },
        {
          tabName: ENTRY_TAB.ADJUSTMENT,
          tabIcon: ICONS.TransformIcon,
          tabContent: <EntryTab adjust {...options} />,
          badge: false,
        },
      ]}
    />
  );
});
