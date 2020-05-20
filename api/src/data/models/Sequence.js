'use strict';

import { COLLECTION } from 'config/formats';
import { Model } from 'data/models/Model';
import { SequenceType } from 'data/models/schema';

class SequenceModel extends Model {
  constructor() {
    super(COLLECTION.SEQUENCE, SequenceType);
    this.schema = SequenceType;
  }

  findOneAndUpdate(db, filter, mod) {
    return super.findOneAndUpdate(db, filter, mod || { $inc: { seq: 1 } }, { returnOriginal: false });
  }

  async findNextSeq(db, cityId, table) {
    const sequence = await this.findOneAndUpdate(db, { cityId, table });
    return sequence.value.seq;
  }
}

export const sequenceModel = new SequenceModel();
