'use strict';

import Model from './Model';

import { category } from './schema';

class Categories extends Model {
  constructor() {
    super('categories', category);
    this.schema = category;
  }

  findForCity(db, cityId) {
    return this.find(db, { cityId: cityId }, { projection: { _id: 0 }, sort: { active: -1, seq: 1 } });
  }
}

export default function () {
  return new Categories();
}
