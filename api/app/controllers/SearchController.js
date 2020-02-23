'use strict';

const transactions = require('../models/Transactions')();
const cu = require('../utils/common-utils');

const doSearch = function (req, resp) {
  const promise = transactions.findForSearch(req.app.locals.db, req.query);

  return cu.sendJson(promise, resp, req.app.locals.log);
};

module.exports = {
  doSearch: doSearch,
};
