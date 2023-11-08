import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import _ from 'lodash';

// @material-ui/core components
import Grid from '@material-ui/core/Grid';

import { COUNTS } from 'app/config';
import { AccountCard } from 'features/dashboard/accounts/AccountCard';
import { sliceAccounts } from 'features/dashboard/accounts/accountUtils';

import { selectAppGlobal } from 'features/appGlobalSlice';
import { selectAccounts } from 'features/accounts/accountSlice';
import { sortAccounts } from 'features/accounts/accountUtils';

export const AccountSection = () => {
  const { accountsExpanded } = useSelector(selectAppGlobal);
  const { accounts } = useSelector(selectAccounts);
  const sortedAccounts = sortAccounts(accounts);

  const slicedAccounts = useMemo(
    () => sliceAccounts(sortedAccounts, accountsExpanded),
    [sortedAccounts, accountsExpanded]
  );
  const gridItemSize = _.round(12 / COUNTS.DASHBOARD_ACCOUNTS);

  return (
    <div style={{ marginTop: '25px', marginBottom: '5px', marginLeft: '5px', marginRight: '5px' }}>
      <Grid container spacing={2}>
        {slicedAccounts.map((e) => (
          <Grid key={e.id} item lg={gridItemSize}>
            <AccountCard account={e} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};
