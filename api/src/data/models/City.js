'use strict';

import { COLLECTION } from 'config/constants';

import { Model } from 'data/models/Model';
import { CityType } from 'data/models/schema';

class CityModel extends Model {
  constructor() {
    super(COLLECTION.CITY, CityType);
    this.schema = CityType;
  }

  findAll(db) {
    return super.findAll(db, { sort: { startDt: -1 } });
  }

  findActive(db) {
    return this.find(db, { active: true }, { sort: { startDt: -1 } });
  }

  findDefault(db) {
    return this.findOne(db, { default: true });
  }
}

export const cityModel = new CityModel();
