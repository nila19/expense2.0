'use strict';

import { transactionModel } from 'models';

export const doSearch = async (db, form) => {
  return await transactionModel.findForSearch(db, form);
};
