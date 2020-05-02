import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { SnackbarProvider } from 'notistack';

import 'index.css';

import * as serviceWorker from 'serviceWorker';
import { store } from 'app/store';
import { App } from 'app/app';
import { COUNTS } from 'app/config';

ReactDOM.render(
  // <React.StrictMode>
  <Provider store={store}>
    <Router>
      <SnackbarProvider maxSnack={COUNTS.MESSAGES}>
        <App />
      </SnackbarProvider>
    </Router>
  </Provider>,
  // </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
