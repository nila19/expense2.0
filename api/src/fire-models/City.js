'use strict';

import { Model } from 'fire-models/Model';

class CityModel extends Model {
  constructor() {
    super('cities', null);
    this.schema = null;
  }

  async findCapital(db) {
    const records = await db.collection(this.collection).where('capital', '==', true).get();
    return super.extract(records);
  }

  async findPopulatedCapital(db) {
    const records = await db
      .collection(this.collection)
      .where('capital', '==', true)
      .where('population', '>', 1000000)
      .get();
    return super.extract(records);
  }

  // async findCACities(db) {
  //   const records = await db.collection(this.collection).where('country', '==', 'USA').where('state', '==', 'CA').get();
  //   return super.extract(records);
  // }

  async findCACities(db) {
    const wheres = [
      ['country', '==', 'USA'],
      ['state', '==', 'CA'],
    ];
    return await this.find(db, wheres);
  }
}

export const cityModel = new CityModel();
