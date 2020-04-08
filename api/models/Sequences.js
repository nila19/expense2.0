'use strict';

import Model from './Model';

import { sequence } from './schema';

class Sequences extends Model {
  constructor() {
    super('sequences', sequence);
    this.schema = sequence;
  }

  findOneAndUpdate(db, filter) {
    // return db.get(this.collection).findAndModify({query: filter, update: {$inc: {seq: 1}}, new: true});
    // return db.get(this.collection).findOneAndUpdate(filter, {$inc: {seq: 1}}, {returnOriginal: false});
    return super.findOneAndUpdate(db, filter, { $inc: { seq: 1 } }, { returnOriginal: false });
  }
}

export default function () {
  return new Sequences();
}
