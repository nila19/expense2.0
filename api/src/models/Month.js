'use strict';

import { Model } from 'models/Model';
import { MonthType } from 'models/schema';

class MonthModel extends Model {
  constructor() {
    super('months', MonthType);
    this.schema = MonthType;
  }

  findForCity(db, cityId, type) {
    const filter = { cityId: cityId, type: type, count: { $gt: 0 } };
    return this.find(db, filter, { projection: { _id: 0 }, sort: { id: -1 } });
  }

  async incrementOrInsert(db, cityId, type, id) {
    const filter = { cityId: cityId, type: type, id: id };
    const mod = {
      $inc: { count: 1 },
      $set: { cityId: cityId, type: type, id: id },
    };
    return super.updateOne(db, filter, mod, { upsert: true });
  }

  async decrement(db, cityId, type, id) {
    const filter = { cityId: cityId, type: type, id: id };
    return super.findOneAndUpdate(db, filter, { $inc: { count: -1 } });
  }
}

export const monthModel = new MonthModel();
