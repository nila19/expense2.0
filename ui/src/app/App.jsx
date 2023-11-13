import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';

import { ThemeProvider, createTheme } from '@mui/material/styles';

import Dashboard from 'features/dashboard/Dashboard';
import Search from 'features/search/Search';
import Summary from 'features/summary/Summary';
import Admin from 'features/admin/Admin';

// import _ from 'lodash';

import 'app/app.css';

import { ROUTE } from 'app/config';
import { Startup, Loading } from 'features/startup/Startup';
import { MenuBar } from 'features/menu/MenuBar';

import { selectStartup, selectStartupReload, STATE } from 'features/startup/startupSlice';

// lazy loaded modules.
// const Dashboard = React.lazy(() => import('features/dashboard/Dashboard'));
// const Search = React.lazy(() => import('features/search/Search'));
// const Summary = React.lazy(() => import('features/summary/Summary'));

// const WithSuspense = (props) => {
//   const loading = <Loading connected inprogress />;
//   return (
//     <DocumentTitle title={props.title}>
//       <Suspense fallback={loading}>{props.render()}</Suspense>
//     </DocumentTitle>
//   );
// };

const theme = createTheme();

const FullApp = () => {
  return (
    <>
      <MenuBar />
      <Routes>
        <Route path={ROUTE.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTE.SUMMARY} element={<Summary />} />
        <Route path={ROUTE.SEARCH} element={<Search />} />
        <Route path={ROUTE.ADMIN} element={<Admin />} />
        {/* Removed lazy loading since it's not working with React-Router-6 */}
        {/* <Route path={ROUTE.SUMMARY}>
          <WithSuspense title='Expense - Summary' render={() => <Summary />} />
        </Route>
        <Route path={ROUTE.SEARCH}>
          <WithSuspense title='Expense - Search' render={() => <Search />} />
        </Route> */}
        <Route path={ROUTE.BASE} element={<Dashboard />} />
      </Routes>
    </>
  );
};

export const App = () => {
  const { connection } = useSelector(selectStartup);
  const { reloadDashboard, loadingCompleted, loadingFailed } = useSelector(selectStartupReload);

  const connectionOK = connection === STATE.FULFILLED;
  const connectionFailed = connection === STATE.REJECTED;
  const loadingOK = reloadDashboard || loadingCompleted;

  let display = null;
  if (connectionOK && loadingOK) {
    display = <FullApp />;
  } else if (connectionFailed || loadingFailed) {
    display = <Loading connected={connectionOK} inprogress={false} />;
  } else {
    display = <Loading connected={connectionOK} inprogress />;
  }

  return (
    <ThemeProvider theme={theme}>
      <Startup />
      {display}
    </ThemeProvider>
  );
};
