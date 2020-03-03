'use strict';

import startup from '../routes/startup-route';
import search from '../routes/search-route';
import summary from '../routes/summary-route';
import edit from '../routes/edit-route';
import dashboard from '../routes/dashboard-route';
import { handler, inject404 } from '../routes/error-route';

export const routes = app => {
  app.use('/app/startup', startup);
  app.use('/app/search', search);
  app.use('/app/summary', summary);
  app.use('/app/edit', edit);
  app.use('/app/dashboard', dashboard);

  // catch 404 and forward to error handler
  app.use(inject404());
  app.use(handler());
};
