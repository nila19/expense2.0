'use strict';

import _ from 'lodash';

import { convertDescriptionsAndMonths, addYears } from 'services/conversion-service';

export const convert = async (req, resp) => {
  await convertDescriptionsAndMonths(req.app.locals.db);
  await addYears(req.app.locals.db);
  return resp.json({ code: 0 });
};
