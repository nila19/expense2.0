import { useEffect } from 'react';

// react-router components
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import moment from 'moment';

// @mui material components
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Material Dashboard 2 React themes
import theme from 'assets/theme';

import { AppRoutes } from 'app/routes';

import 'app/app.css';

import { Startup, Loading } from 'features/startup/Startup';
import { MenuBar } from 'features/menu/MenuBar';

import { selectStartup, selectStartupReload, STATE } from 'features/startup/startupSlice';

const FullApp = () => {
  const { pathname } = useLocation();

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  return (
    <>
      <CssBaseline />
      <MenuBar />
      <AppRoutes />
    </>
  );
};

export const App = () => {
  const { connection } = useSelector(selectStartup);
  const { reloadDashboard, loadingCompleted, loadingFailed } = useSelector(selectStartupReload);

  moment.locale('en');

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
      <>
        <Startup />
        {display}
      </>
    </ThemeProvider>
  );
};
