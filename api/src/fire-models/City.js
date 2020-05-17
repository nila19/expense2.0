'use strict';

import { Model } from 'fire-models/Model';

class CityModel extends Model {
  constructor() {
    super('cities', false, null);
    this.schema = null;
  }

  async findCapitals(db) {
    const filters = [['capital', '==', true]];
    const orders = [['country', 'asc']];
    return await this.find(db, filters, orders, 3);
  }

  async findPopulatedCapitals(db) {
    const filters = [
      ['capital', '==', true],
      ['population', '>', 1000000],
    ];
    return await this.find(db, filters);
  }

  async findCACities(db) {
    const filters = [
      ['country', '==', 'USA'],
      ['state', '==', 'CA'],
    ];
    return await this.find(db, filters);
  }
}

export const cityModel = new CityModel();
