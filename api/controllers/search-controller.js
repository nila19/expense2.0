'use strict';

import { transactions } from '../models';

export const doSearch = async (req, resp) => {
  const data = await transactions.findForSearch(req.app.locals.db, req.body);
  return resp.json({ code: 0, data: data });
};
