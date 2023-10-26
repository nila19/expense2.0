'use strict';

import { PIPE, STATE, publish } from 'bin/socket-handler';
import { COLLECTION } from 'config/constants';

import { Model } from 'data/models/Model';
import { BillType } from 'data/models/schema';

class BillModel extends Model {
  constructor() {
    super(COLLECTION.BILL, BillType);
    this.schema = BillType;
  }

  findForCity(db, cityId, open) {
    let filter = { cityId: cityId };
    filter = open ? { ...filter, closed: false } : filter;
    return this.find(db, filter, { projection: { _id: 0 }, sort: { billDt: -1 } });
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

  async _publish(db, id, state, promise) {
    await promise;
    const bill = state === STATE.DELETED ? { id: id } : await this.findById(db, id);
    publish(PIPE.BILL, bill, state);
  }
}

export const billModel = new BillModel();
