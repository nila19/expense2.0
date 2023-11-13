import React, { useState } from 'react';

import { Grid } from '@mui/material';

import { COUNTS } from 'app/config';
import { AddAccount } from 'features/admin/accounts/AddAccount';
import { AccountsSection } from 'features/admin/accounts/AccountsSection';

const Admin = () => {
  const [rowsPerPage, setRowsPerPage] = useState(COUNTS.ADMIN_ACCOUNTS);

  return (
    <>
      <AddAccount />
      <Grid container spacing={2} alignItems='flex-start' style={{ marginTop: -20 }}>
        <Grid item lg={12}>
          <AccountsSection rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
        </Grid>
      </Grid>
    </>
  );
};

// default export to facilitate lazy loading
export default Admin;
