'use strict';

import Model from './Model';

import { CategoryType } from './schema';

class Category extends Model {
  constructor() {
    super('categories', CategoryType);
    this.schema = CategoryType;
  }

  findForCity(db, cityId) {
    return this.find(db, { cityId: cityId }, { projection: { _id: 0 }, sort: { active: -1, seq: 1 } });
  }
}

export default function () {
  return new Category();
}
