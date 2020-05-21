'use strict';

import { router as startup } from 'routes/startup-route';
import { router as account } from 'routes/account-route';
import { router as bill } from 'routes/bill-route';
import { router as expense } from 'routes/expense-route';
import { router as search } from 'routes/search-route';
import { router as summary } from 'routes/summary-route';
import { router as conversion } from 'routes/conversion-route';
import { handler, inject404 } from 'routes/error-route';

import { router as fireLoad } from 'routes/fire-load-route';
import { router as fireStartup } from 'routes/fire-startup-route';

export const routes = (app) => {
  app.use('/app/startup', startup);
  app.use('/app/account', account);
  app.use('/app/bill', bill);
  app.use('/app/expense', expense);
  app.use('/app/search', search);
  app.use('/app/summary', summary);
  app.use('/app/conversion', conversion);

  app.use('/app/fire/load', fireLoad);
  app.use('/app/fire/startup', fireStartup);

  // catch 404 and forward to error handler
  app.use(inject404());
  app.use(handler());
};
