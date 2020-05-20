'use strict';

import { COLLECTION } from 'config/constants';
import { Model } from 'data/models/Model';
import { DescriptionType } from 'data/models/schema';

class DescriptionModel extends Model {
  constructor() {
    super(COLLECTION.DESCRIPTION, DescriptionType);
    this.schema = DescriptionType;
  }

  findForCity(db, cityId) {
    const filter = { cityId: cityId, count: { $gt: 0 } };
    return super.find(db, filter, { projection: { _id: 0 }, sort: { count: -1 } });
  }

  incrementOrInsert(db, cityId, id) {
    const filter = { cityId: cityId, id: id };
    const mod = {
      $inc: { count: 1 },
      $set: { cityId: cityId, id: id },
    };
    return super.updateOne(db, filter, mod, { upsert: true });
  }

  decrement(db, cityId, id) {
    const filter = { cityId: cityId, id: id };
    return super.findOneAndUpdate(db, filter, { $inc: { count: -1 } });
  }
}

export const descriptionModel = new DescriptionModel();
