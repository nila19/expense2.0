import React, { Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Grid } from "@mui/material";

import { EXPENSE_BLOCK } from "app/constants";

import { Loading } from "features/startup/Startup";

import { AccountSection } from "features/dashboard/accounts/AccountSection";
import { BillSection } from "features/dashboard/bills/BillSection";
import { EntrySection } from "features/dashboard/entry/EntrySection";
import { ChartSection } from "features/dashboard/chart/ChartSection";
import { ExpenseSection } from "features/search/expenses/ExpenseSection";

import { selectAppGlobal } from "features/appGlobalSlice";
import { clearSearchResults } from "features/search/expenses/expenseSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { showChartBlock } = useSelector(selectAppGlobal);

  useEffect(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  const loading = <Loading connected inprogress />;

  return (
    <>
      <AccountSection />
      <Grid container spacing={2} style={{ marginTop: -10 }}>
        <Grid item lg={6}>
          <Suspense fallback={loading}>
            <BillSection />
          </Suspense>
        </Grid>
        <Grid item lg={6}>
          <Suspense fallback={loading}>
            {showChartBlock ? <ChartSection /> : <EntrySection />}
          </Suspense>
        </Grid>
      </Grid>
      <Grid container spacing={2} style={{ marginTop: -5 }}>
        <Grid item lg={12}>
          <Suspense fallback={loading}>
            <ExpenseSection section={EXPENSE_BLOCK.DASHBOARD} />
          </Suspense>
        </Grid>
      </Grid>
    </>
  );
};

// default export to facilitate lazy loading
export default Dashboard;
