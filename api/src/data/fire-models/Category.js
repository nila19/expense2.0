'use strict';

import { Model } from 'data/fire-models/Model';
import { CategoryType } from 'data/fire-models/schema';

class CategoryModel extends Model {
  constructor() {
    super('categories', false, CategoryType);
    this.schema = CategoryType;
  }

  findForCity(db, cityId) {
    return super.find(db, {
      filters: [['cityId', '==', cityId]],
      orders: [
        ['active', 'desc'],
        ['seq', 'desc'],
      ],
    });
  }
}

export const categoryModel = new CategoryModel();
