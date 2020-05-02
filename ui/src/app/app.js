import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';

import _ from 'lodash';

import 'app/app.css';

import { Startup, Loading } from 'features/startup/startup';
import { MenuBar } from 'features/menu/menuBar';
import { Dashboard } from 'features/dashboard/dashboard';
import { Search } from 'features/search/search';

import { selectStartup, STATE } from 'features/startup/startupSlice';

const FullApp = () => {
  return (
    <>
      <MenuBar />
      <Switch>
        <Route path='/dashboard'>
          <Dashboard />
        </Route>
        <Route path='/summary'>
          <div>Summary page</div>
        </Route>
        <Route path='/search'>
          <Search />
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

  const connectionSuccessful = connection === STATE.FULFILLED;
  const connectionFailed = connection === STATE.REJECTED;
  const allLoaded = _.every(loadings, (e) => e === STATE.FULFILLED);
  const anyFailed = _.some(loadings, (e) => e === STATE.REJECTED);

  let display = null;
  if (connectionSuccessful && allLoaded) {
    display = <FullApp />;
  } else if (connectionFailed || anyFailed) {
    display = <Loading connection={connectionSuccessful} failed={true} />;
  } else {
    display = <Loading connection={connectionSuccessful} failed={false} />;
  }

  return (
    <>
      <Startup />
      {display}
    </>
  );
};
