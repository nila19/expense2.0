'use strict';

import { transactionModel } from 'models';

export const doSearch = async (req, resp) => {
  const data = await transactionModel.findForSearch(req.app.locals.db, req.body);
  return resp.json({ code: 0, data: data });
};
