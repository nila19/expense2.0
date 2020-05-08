import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Grid } from '@material-ui/core';

import { COUNTS } from 'app/config';
import { EXPENSE_BLOCK } from 'app/constants';
import { AccountSection } from 'features/dashboard/accounts/AccountSection';
import { BillSection } from 'features/dashboard/bills/BillSection';
import { EntrySection } from 'features/dashboard/entry/EntrySection';
import { ExpenseSection } from 'features/search/expenses/ExpenseSection';

import { clearSearchResults } from 'features/search/expenses/expenseSlice';

const Dashboard = () => {
  const dispatch = useDispatch();

  const [rowsPerPage, setRowsPerPage] = useState(COUNTS.DASHBOARD_EXPENSES);

  useEffect(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  return (
    <>
      <AccountSection />
      <Grid container spacing={2} alignItems='flex-start' style={{ marginTop: -15 }}>
        <Grid item lg={6}>
          <BillSection />
        </Grid>
        <Grid item lg={6}>
          <EntrySection />
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems='flex-start' style={{ marginTop: -20 }}>
        <Grid item lg={12}>
          <ExpenseSection section={EXPENSE_BLOCK.DASHBOARD} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
        </Grid>
      </Grid>
    </>
  );
};

// default export to facilitate lazy loading
export default Dashboard;
