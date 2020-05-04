'use strict';

import _ from 'lodash';

import { bills, cities } from '../models';
import { closeBill } from './bill-service';

// unused, since billCloser is disabled in config.
export const executeBillClosure = async (parms) => {
  const stats = { closed: 0 };
  const city = await cities.findDefault(parms.db);
  const _bills = await bills.findForCityOpen(parms.db, city.id);

  for (const bill of _bills) {
    try {
      closeBill(parms, { id: bill.id });
      stats.closed += 1;
    } catch (error) {
      parms.log.info('BillCloser : [#' + bill.id + '] => ' + error.message);
    }
  }
  parms.log.info('BillCloser :: ' + JSON.stringify(stats));
};
