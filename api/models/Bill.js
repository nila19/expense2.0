'use strict';

import Model from './Model';
import { publish, PIPE } from '../bin/socket-handler';

import { BillType } from './schema';

class Bill extends Model {
  constructor() {
    super('bills', BillType);
    this.schema = BillType;
  }

  // paid = null, get all;
  // paid = 'N', getUnpaid only,
  // paid = 'Y', getPaid only
  findForCity(db, cityId, paid) {
    const filter = { cityId: cityId, closed: true };
    if (paid) {
      filter.balance = paid === 'Y' ? 0 : { $gt: 0 };
    }
    return this.find(db, filter, { projection: { _id: 0 }, sort: { billDt: -1 } });
  }

  // paid = null, get all (including 'open', for modify dropdown);
  // paid = 'N', getUnpaid only,
  // paid = 'Y', getPaid only
  findForAcct(db, acctId, paid) {
    const filter = { 'account.id': acctId };
    if (paid) {
      filter.balance = paid === 'Y' ? 0 : { $gt: 0 };
      filter.closed = true;
    }
    return this.find(db, filter, { projection: { _id: 0 }, sort: { billDt: -1 } });
  }

  // used by billCloser
  findForCityOpen(db, cityId) {
    return this.find(db, { cityId: cityId, closed: false }, { projection: { _id: 0 }, sort: { billDt: -1 } });
  }

  findOneAndUpdate(db, filter, mod, options) {
    const promise = super.findOneAndUpdate(db, filter, mod, options);
    this._publish(db, filter.id, promise);
    return promise;
  }

  updateOne(db, filter, mod, options) {
    const promise = super.updateOne(db, filter, mod, options);
    this._publish(db, filter.id, promise);
    return promise;
  }

  buildBillName(acct, bill) {
    return bill.id ? acct.name + ' : ' + bill.billDt + ' #' + bill.id : acct.name + ' #0';
  }

  // utility method
  async _publish(db, id, promise) {
    await promise;
    const bill = await this.findById(db, id);
    publish(PIPE.BILL, bill);
  }
}

export default function () {
  return new Bill();
}
