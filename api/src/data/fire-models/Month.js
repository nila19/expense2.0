'use strict';

import firebase from 'firebase';

import { Model } from 'data/fire-models/Model';
import { MonthType } from 'data/fire-models/schema';

const incrementByOne = firebase.firestore.FieldValue.increment(1);
const decrementByOne = firebase.firestore.FieldValue.increment(-1);

class MonthModel extends Model {
  constructor() {
    super('months', false, MonthType);
    this.schema = MonthType;
  }

  findForCity(db, cityId, type) {
    return super.find(db, {
      filters: [
        ['cityId', '==', cityId],
        ['type', '==', type],
        ['count', '>', 0],
      ],
      orders: [['id', 'desc']],
    });
  }

  incrementOrInsert(db, cityId, type, id) {
    const filters = [
      ['cityId', '==', cityId],
      ['type', '==', type],
      ['id', '==', id],
    ];

    const item = await super.findOne(db, filters);
    if(item) {
      return super.updateById(db, item._id, {count: incrementByOne})
    } else {
      const data = {cityId, type, id, count: 1};
      return super.insertOne(db, data)
    }
  }

  decrement(db, cityId, type, id) {
    const filters = [
      ['cityId', '==', cityId],
      ['type', '==', type],
      ['id', '==', id],
    ];
    return super.findOneAndUpdate(db, filters, {count: decrementByOne});
  }
}

export const monthModel = new MonthModel();
