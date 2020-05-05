'use strict';

import _ from 'lodash';

import { billModel, cityModel } from 'models';
import { closeBill } from 'services/bill-service';

// unused, since billCloser is disabled in config.
export const executeBillClosure = async (parms) => {
  const stats = { closed: 0 };
  const city = await cityModel.findDefault(parms.db);
  const bills = await billModel.findForCityOpen(parms.db, city.id);

  for (const bill of bills) {
    try {
      closeBill(parms, { id: bill.id });
      stats.closed += 1;
    } catch (error) {
      parms.log.info('BillCloser : [#' + bill.id + '] => ' + error.message);
    }
  }
  parms.log.info('BillCloser :: ' + JSON.stringify(stats));
};
