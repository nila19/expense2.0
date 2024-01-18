import React from 'react';

import { Grid } from '@mui/material';

import { EXPENSE_BLOCK } from 'app/constants';

import { ExpenseSection } from 'features/search/expenses/ExpenseSection';
import { SearchSection } from 'features/search/form/SearchSection';

const Search = () => {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item lg={12}>
          <SearchSection />
        </Grid>
        <Grid item lg={12}>
          <ExpenseSection section={EXPENSE_BLOCK.SEARCH} />
        </Grid>
      </Grid>
    </>
  );
};

// default export to facilitate lazy loading
export default Search;
