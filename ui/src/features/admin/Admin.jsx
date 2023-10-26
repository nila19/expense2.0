import React, { useState } from 'react';

import { Grid } from '@material-ui/core';

import { COUNTS } from 'app/config';
import { ExpenseSection } from 'features/search/expenses/ExpenseSection';
import { AddForm } from 'features/admin/form/AddForm';

const Search = () => {
  const [rowsPerPage, setRowsPerPage] = useState(COUNTS.ADMIN_ACCOUNTS);

  return (
    <>
      <AddForm />
      <Grid container spacing={2} alignItems='flex-start' style={{ marginTop: -20 }}>
        <Grid item lg={12}>
          {/* <ExpenseSection rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} /> */}
        </Grid>
      </Grid>
    </>
  );
};

// default export to facilitate lazy loading
export default Search;
