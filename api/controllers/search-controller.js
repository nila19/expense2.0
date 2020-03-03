'use strict';

import { transactions } from '../models';

import { sendJson } from '../utils/common-utils';

// TODO: move the db logic to service
export const doSearch = (req, resp) => {
  const promise = transactions.findForSearch(req.app.locals.db, req.query);
  return sendJson(promise, resp, req.app.locals.log);
};
