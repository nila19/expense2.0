import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider, createTheme, adaptV4Theme } from '@mui/material/styles';

import { SnackbarProvider } from 'notistack';

// import { MaterialUIControllerProvider } from 'context';

import 'index.css';

import * as serviceWorker from 'serviceWorker';
import { store } from 'app/store';
import { App } from 'app/App';
import { COUNTS } from 'app/config';

const theme = createTheme(
  adaptV4Theme({
    components: {
      MuiButton: {
        defaultProps: {
          variant: 'standard',
        },
      },
    },
  })
);

ReactDOM.render(
  // <React.StrictMode>
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        {/* <MaterialUIControllerProvider> */}
        <SnackbarProvider maxSnack={COUNTS.MESSAGES}>
          <App />
        </SnackbarProvider>
        {/* </MaterialUIControllerProvider> */}
      </BrowserRouter>
    </ThemeProvider>
  </Provider>,
  // </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
