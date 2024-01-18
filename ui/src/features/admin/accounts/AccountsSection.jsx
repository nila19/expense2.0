import React, { memo } from 'react';

import { AppSection } from 'components/app/AppSection';

import { AccountsTab } from 'features/admin/accounts/AccountsTab';

export const AccountsSection = memo(() => {
  return <AppSection title='ACCOUNTS' headerColor='info' content=<AccountsTab /> />;
});
