'use strict';

import { Model } from 'fire-models/Model';
import { CityType } from 'fire-models/schema';

class CityModel extends Model {
  constructor() {
    super('cities', false, CityType);
    this.schema = CityType;
  }

  findAll(db) {
    return super.find(db, { orders: [['startDt', 'desc']] });
  }

  findActive(db) {
    return this.find(db, { filters: [['active', '==', true]], orders: [['startDt', 'desc']] });
  }

  findDefault(db) {
    return this.findOne(db, { filters: [['default', '==', true]] });
  }
}

export const cityModel = new CityModel();
