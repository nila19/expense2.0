'use strict';

import { Model } from 'models/Model';
import { SequenceType } from 'models/schema';

class SequenceModel extends Model {
  constructor() {
    super('sequences', SequenceType);
    this.schema = SequenceType;
  }

  findOneAndUpdate(db, filter, mod) {
    return super.findOneAndUpdate(db, filter, mod || { $inc: { seq: 1 } }, { returnOriginal: false });
  }
}

export const sequenceModel = new SequenceModel();
