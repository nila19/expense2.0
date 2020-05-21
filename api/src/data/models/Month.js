'use strict';

import { COLLECTION } from 'config/constants';

import { Model } from 'data/models/Model';
import { MonthType } from 'data/models/schema';

class MonthModel extends Model {
  constructor() {
    super(COLLECTION.MONTH, MonthType);
    this.schema = MonthType;
  }

  findForCity(db, cityId, type) {
    const filter = { cityId: cityId, type: type, count: { $gt: 0 } };
    return this.find(db, filter, { projection: { _id: 0 }, sort: { id: -1 } });
  }

  incrementOrInsert(db, cityId, type, id) {
    const filter = { cityId: cityId, type: type, id: id };
    const mod = {
      $inc: { count: 1 },
      $set: { cityId: cityId, type: type, id: id },
    };
    return super.updateOne(db, filter, mod, { upsert: true });
  }

  decrement(db, cityId, type, id) {
    const filter = { cityId: cityId, type: type, id: id };
    return super.findOneAndUpdate(db, filter, { $inc: { count: -1 } });
  }
}

export const monthModel = new MonthModel();
