import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import DocumentTitle from 'react-document-title';

import _ from 'lodash';

import 'app/app.css';

import { Startup, Loading } from 'features/startup/startup';
import { MenuBar } from 'features/menu/menuBar';

import { selectStartup, STATE } from 'features/startup/startupSlice';

// lazy loaded modules.
const Dashboard = React.lazy(() => import('features/dashboard/dashboard'));
const Search = React.lazy(() => import('features/search/search'));

const WithSuspense = (props) => {
  const loading = <Loading connected={true} inprogress={true} />;
  return (
    <DocumentTitle title={props.title}>
      <Suspense fallback={loading}>{props.render()}</Suspense>
    </DocumentTitle>
  );
};

const FullApp = () => {
  return (
    <>
      <MenuBar />
      <Switch>
        <Route path='/dashboard'>
          <WithSuspense title='Expense - Dashboard' render={() => <Dashboard />} />
        </Route>
        <Route path='/summary'>
          <WithSuspense title='Expense - Summary' render={() => <div>Summary page</div>} />
        </Route>
        <Route path='/search'>
          <WithSuspense title='Expense - Search' render={() => <Search />} />
        </Route>
        <Route path='/'>
          <Redirect to='/dashboard' />
        </Route>
      </Switch>
    </>
  );
};

export const App = () => {
  const { connection, loading } = useSelector(selectStartup);
  const loadings = [loading.cities, loading.categories, loading.descriptions, loading.transMonths, loading.entryMonths];

  const connected = connection === STATE.FULFILLED;
  const connectionFailed = connection === STATE.REJECTED;
  const allLoaded = _.every(loadings, (e) => e === STATE.FULFILLED);
  const anyFailed = _.some(loadings, (e) => e === STATE.REJECTED);

  let display = null;
  if (connected && allLoaded) {
    display = <FullApp />;
  } else if (connectionFailed || anyFailed) {
    display = <Loading connected={connected} inprogress={false} />;
  } else {
    display = <Loading connected={connected} inprogress={true} />;
  }

  return (
    <>
      <Startup />
      {display}
    </>
  );
};
