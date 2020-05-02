import React, { useState } from 'react';

import { Grid } from '@material-ui/core';

import { COUNTS } from 'app/config';

import { ExpenseSection } from 'features/search/expenses/expenseSection';
import { SearchForm } from 'features/search/form/searchForm';

export const Search = () => {
  const [rowsPerPage, setRowsPerPage] = useState(COUNTS.SEARCH_EXPENSES);

  return (
    <>
      <SearchForm />
      <Grid container spacing={2} alignItems='flex-start' style={{ marginTop: -20 }}>
        <Grid item lg={12}>
          <ExpenseSection rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
        </Grid>
      </Grid>
    </>
  );
};
