import React, { useState } from 'react';

import { Grid } from '@mui/material';

import { COUNTS } from 'app/config';
import { EXPENSE_BLOCK } from 'app/constants';
import { ExpenseSection } from 'features/search/expenses/ExpenseSection';
import { SearchForm } from 'features/search/form/SearchForm';

const Search = () => {
  const [rowsPerPage, setRowsPerPage] = useState(COUNTS.SEARCH_EXPENSES);

  return (
    <>
      <SearchForm />
      <Grid container spacing={2} alignItems='flex-start' style={{ marginTop: -20 }}>
        <Grid item lg={12}>
          <ExpenseSection section={EXPENSE_BLOCK.SEARCH} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
        </Grid>
      </Grid>
    </>
  );
};

// default export to facilitate lazy loading
export default Search;
