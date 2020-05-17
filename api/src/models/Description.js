'use strict';

import { Model } from 'models/Model';
import { DescriptionType } from 'models/schema';

class DescriptionModel extends Model {
  constructor() {
    super('descriptions', DescriptionType);
    this.schema = DescriptionType;
  }

  findForCity(db, cityId) {
    const filter = { cityId: cityId, count: { $gt: 0 } };
    return super.find(db, filter, { projection: { _id: 0 }, sort: { count: -1 } });
  }

  async incrementOrInsert(db, cityId, id) {
    const filter = { cityId: cityId, id: id };
    const mod = {
      $inc: { count: 1 },
      $set: { cityId: cityId, id: id },
    };
    return super.updateOne(db, filter, mod, { upsert: true });
  }

  async decrement(db, cityId, id) {
    const filter = { cityId: cityId, id: id };
    return super.findOneAndUpdate(db, filter, { $inc: { count: -1 } });
  }
}

export const descriptionModel = new DescriptionModel();
