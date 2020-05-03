import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Grid } from '@material-ui/core';

import { COUNTS } from 'app/config';
import { AccountSection } from 'features/dashboard/accounts/accountSection';
import { BillSection } from 'features/dashboard/bills/billSection';
import { EntrySection } from 'features/dashboard/entry/entrySection';
import { ExpenseSection } from 'features/search/expenses/expenseSection';

import { loadExpenses } from 'features/search/expenses/expensesSlice';

const Dashboard = () => {
  const dispatch = useDispatch();

  const [rowsPerPage, setRowsPerPage] = useState(COUNTS.DASHBOARD_EXPENSES);

  useEffect(() => {
    dispatch(loadExpenses());
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
          <ExpenseSection rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
        </Grid>
      </Grid>
    </>
  );
};

// default export to facilitate lazy loading
export default Dashboard;
