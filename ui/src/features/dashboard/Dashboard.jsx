import React, { Suspense, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Grid } from '@material-ui/core';

import { COUNTS } from 'app/config';
import { EXPENSE_BLOCK } from 'app/constants';
import { Loading } from 'features/startup/Startup';
import { AccountSection } from 'features/dashboard/accounts/AccountSection';
import { BillSection } from 'features/dashboard/bills/BillSection';
import { EntrySection } from 'features/dashboard/entry/EntrySection';
import { ChartSection } from 'features/dashboard/chart/ChartSection';
import { ExpenseSection } from 'features/search/expenses/ExpenseSection';

import { selectAppGlobal } from 'features/appGlobalSlice';
import { clearSearchResults } from 'features/search/expenses/expenseSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { showChartBlock } = useSelector(selectAppGlobal);

  const [rowsPerPage, setRowsPerPage] = useState(COUNTS.DASHBOARD_EXPENSES);

  useEffect(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  const loading = <Loading connected inprogress />;

  return (
    <>
      <AccountSection />
      <Grid container spacing={2} alignItems='flex-start' style={{ marginTop: -15 }}>
        <Grid item lg={6}>
          <Suspense fallback={loading}>
            <BillSection />
          </Suspense>
        </Grid>
        <Grid item lg={6}>
          <Suspense fallback={loading}>{showChartBlock ? <ChartSection /> : <EntrySection />}</Suspense>
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems='flex-start' style={{ marginTop: -20 }}>
        <Grid item lg={12}>
          <Suspense fallback={loading}>
            <ExpenseSection
              section={EXPENSE_BLOCK.DASHBOARD}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
            />
          </Suspense>
        </Grid>
      </Grid>
    </>
  );
};

// default export to facilitate lazy loading
export default Dashboard;
