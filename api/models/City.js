'use strict';

import Model from './Model';

import { CityType } from './schema';

class City extends Model {
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

export default function () {
  return new City();
}
