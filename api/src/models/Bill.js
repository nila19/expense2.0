'use strict';

import { PIPE, STATE, publish } from 'bin/socket-handler';
import { Model } from 'models/Model';
import { BillType } from 'models/schema';

class BillModel extends Model {
  constructor() {
    super('bills', BillType);
    this.schema = BillType;
  }

  findForCity(db, cityId) {
    const filter = { cityId: cityId };
    return this.find(db, filter, { projection: { _id: 0 }, sort: { billDt: -1 } });
  }

  // paid = null, get all (including 'open', for modify dropdown);
  // paid = 'N', getUnpaid only,
  // paid = 'Y', getPaid only
  findForAcct(db, acctId, paid) {
    const filter = { 'account.id': acctId };
    if (paid) {
      filter.balance = paid === 'Y' ? 0 : { $gt: 0 };
    }
    return this.find(db, filter, { projection: { _id: 0 }, sort: { billDt: -1 } });
  }

  // used by billCloser
  findForCityOpen(db, cityId) {
    return this.find(db, { cityId: cityId, closed: false }, { projection: { _id: 0 }, sort: { billDt: -1 } });
  }

  findOneAndUpdate(db, filter, mod, options) {
    const promise = super.findOneAndUpdate(db, filter, mod, options);
    this._publish(db, filter.id, STATE.UPDATED, promise);
    return promise;
  }

  insertOne(db, data) {
    const promise = super.insertOne(db, data);
    this._publish(db, data.id, STATE.CREATED, promise);
    return promise;
  }

  buildBillName(acct, bill) {
    return bill.id ? acct.name + ' : ' + bill.billDt + ' #' + bill.id : acct.name + ' #0';
  }

  async _publish(db, id, state, promise) {
    await promise;
    const bill = state === STATE.DELETED ? { id: id } : await this.findById(db, id);
    publish(PIPE.BILL, bill, state);
  }
}

export const billModel = new BillModel();
