'use strict';

import { doSearch as _doSearch } from 'services/search-service';

export const doSearch = async (req, resp) => {
  const data = await _doSearch(req.app.locals.db, req.body);
  return resp.json({ code: 0, data: data });
};
