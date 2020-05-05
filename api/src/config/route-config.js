'use strict';

import { router as startup } from 'routes/startup-route';
import { router as search } from 'routes/search-route';
import { router as summary } from 'routes/summary-route';
import { router as edit } from 'routes/edit-route';
import { router as dashboard } from 'routes/dashboard-route';
import { handler, inject404 } from 'routes/error-route';

export const routes = (app) => {
  app.use('/app/startup', startup);
  app.use('/app/search', search);
  app.use('/app/summary', summary);
  app.use('/app/edit', edit);
  app.use('/app/dashboard', dashboard);

  // catch 404 and forward to error handler
  app.use(inject404());
  app.use(handler());
};
