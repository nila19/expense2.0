'use strict';

import { router as startup } from 'routes/startup-route';
import { router as account } from 'routes/account-route';
import { router as bill } from 'routes/bill-route';
import { router as expense } from 'routes/expense-route';
import { router as search } from 'routes/search-route';
import { router as summary } from 'routes/summary-route';
import { router as load } from 'routes/load-route';
import { router as conversion } from 'routes/conversion-route';
import { handler, inject404 } from 'routes/error-route';

export const routes = (app) => {
  app.use('/app/startup', startup);
  app.use('/app/account', account);
  app.use('/app/bill', bill);
  app.use('/app/expense', expense);
  app.use('/app/search', search);
  app.use('/app/summary', summary);
  app.use('/app/load', load);
  app.use('/app/conversion', conversion);

  // catch 404 and forward to error handler
  app.use(inject404());
  app.use(handler());
};
