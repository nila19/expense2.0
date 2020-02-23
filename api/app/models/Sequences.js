'use strict';

const Model = require('./Model');
const schema = {
  table: 'string not-null primarykey',
  cityId: 'int not-null',
  seq: 'int not-null',
};

class Sequences extends Model {
  constructor() {
    super('sequences');
    this.schema = schema;
  }
  getNextSeq(db, filter) {
    // return db.get(this.collection).findAndModify({query: filter, update: {$inc: {seq: 1}}, new: true});
    // return db.get(this.collection).findOneAndUpdate(filter, {$inc: {seq: 1}}, {returnOriginal: false});
    return super.findOneAndUpdate(db, filter, {$inc: {seq: 1}}, {returnOriginal: false});
  }
}

module.exports = function () {
  return new Sequences();
};
