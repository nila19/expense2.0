'use strict';

import { Model } from 'models/Model';
import { SequenceType } from 'models/schema';

class SequenceModel extends Model {
  constructor() {
    super('sequences', SequenceType);
    this.schema = SequenceType;
  }

  findOneAndUpdate(db, filter) {
    // return db.get(this.collection).findAndModify({query: filter, update: {$inc: {seq: 1}}, new: true});
    // return db.get(this.collection).findOneAndUpdate(filter, {$inc: {seq: 1}}, {returnOriginal: false});
    return super.findOneAndUpdate(db, filter, { $inc: { seq: 1 } }, { returnOriginal: false });
  }
}

export const sequenceModel = new SequenceModel();
