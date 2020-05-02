import React from 'react';
import { useSelector } from 'react-redux';

import _ from 'lodash';

// @material-ui/core components
import Grid from '@material-ui/core/Grid';

import { COUNTS } from 'app/config';
import { AccountCard } from 'features/dashboard/accounts/accountCard';

import { selectAppGlobal } from 'features/appGlobalSlice';
import { selectAccounts } from 'features/dashboard/accounts/accountsSlice';

export const AccountSection = () => {
  const { accountsExpanded } = useSelector(selectAppGlobal);
  const accounts = useSelector(selectAccounts);

  const slicedAccounts = accountsExpanded ? accounts : _.slice(accounts, 0, COUNTS.DASHBOARD_ACCOUNTS);
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
