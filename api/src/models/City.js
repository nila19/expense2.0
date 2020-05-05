'use strict';

import { Model } from 'models/Model';
import { CityType } from 'models/schema';

class CityModel extends Model {
  constructor() {
    super('cities', CityType);
    this.schema = CityType;
  }

  findAllCities(db) {
    return this.findAll(db, { projection: { _id: 0 }, sort: { startDt: -1 } });
  }

  findActive(db) {
    return this.find(db, { active: true }, { projection: { _id: 0 }, sort: { startDt: -1 } });
  }

  findDefault(db) {
    return this.findOne(db, { default: true });
  }
}

export const cityModel = new CityModel();
