'use strict';

import firebase from 'firebase';

import { Model } from 'fire-models/Model';
import { DescriptionType } from 'fire-models/schema';

const incrementByOne = firebase.firestore.FieldValue.increment(1);
const decrementByOne = firebase.firestore.FieldValue.increment(-1);

class DescriptionModel extends Model {
  constructor() {
    super('descriptions', false, DescriptionType);
    this.schema = DescriptionType;
  }

  findForCity(db, cityId) {
    return super.find(db, {
      filters: [
        ['cityId', '==', cityId],
        ['count', '>', 0],
      ],
      orders: [['count', 'desc']],
    });
  }

  incrementOrInsert(db, cityId, id) {
    const filters = [
      ['cityId', '==', cityId],
      ['id', '==', id],
    ];

    const item = await super.findOne(db, filters);
    if(item) {
      return super.updateById(db, item._id, {count: incrementByOne})
    } else {
      const data = {cityId, id, count: 1};
      return super.insertOne(db, data)
    }
  }

  decrement(db, cityId, id) {
    const filters = [
      ['cityId', '==', cityId],
      ['id', '==', id],
    ];
    return super.findOneAndUpdate(db, filters, {count: decrementByOne});
  }
}

export const descriptionModel = new DescriptionModel();
