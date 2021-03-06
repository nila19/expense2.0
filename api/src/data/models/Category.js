'use strict';

import { COLLECTION } from 'config/constants';

import { Model } from 'data/models/Model';
import { CategoryType } from 'data/models/schema';

class CategoryModel extends Model {
  constructor() {
    super(COLLECTION.CATEGORY, CategoryType);
    this.schema = CategoryType;
  }

  findForCity(db, cityId) {
    return this.find(db, { cityId: cityId }, { projection: { _id: 0 }, sort: { active: -1, seq: 1 } });
  }
}

export const categoryModel = new CategoryModel();
