'use strict';

import { Model } from 'models/Model';
import { CategoryType } from 'models/schema';

class CategoryModel extends Model {
  constructor() {
    super('categories', CategoryType);
    this.schema = CategoryType;
  }

  findForCity(db, cityId) {
    return this.find(db, { cityId: cityId }, { projection: { _id: 0 }, sort: { active: -1, seq: 1 } });
  }
}

export const categoryModel = new CategoryModel();
