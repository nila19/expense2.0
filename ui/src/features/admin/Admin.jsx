import React, { useState } from 'react';

import { Grid } from '@material-ui/core';

import { COUNTS } from 'app/config';
import { AddAccount } from 'features/admin/add/AddAccount';
import { AccountsSection } from 'features/admin/list/AccountsSection';

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
