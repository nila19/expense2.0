'use strict';

import firebase from 'firebase';

import { Model } from 'fire-models/Model';
import { SequenceType } from 'fire-models/schema';

const incrementByOne = firebase.firestore.FieldValue.increment(1);

class SequenceModel extends Model {
  constructor() {
    super('sequences', false, SequenceType);
    this.schema = SequenceType;
  }

  findOneAndUpdate(db, cityId, table) {
    const filters = [
      ['cityId', '==', cityId],
      ['table', '==', table],
    ];
    return super.findOneAndUpdate(db, filters, { seq: incrementByOne });
  }
}

export const sequenceModel = new SequenceModel();
