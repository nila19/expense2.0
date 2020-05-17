'use strict';

import _ from 'lodash';

export class Model {
  constructor(collection, schema) {
    this.collection = collection;
    this.schema = schema;
  }

  findById(db, id) {
    return db.collection(this.collection).findOne({ id: id });
  }

  findOne(db, filter, options) {
    return db.collection(this.collection).findOne(filter, options || {});
  }

  updateOne(db, filter, mod, options) {
    return db.collection(this.collection).updateOne(filter, mod, options || {});
  }

  findOneAndUpdate(db, filter, mod, options) {
    return db.collection(this.collection).findOneAndUpdate(filter, mod, options || { returnOriginal: false });
  }

  find(db, filter, options) {
    return db
      .collection(this.collection)
      .find(filter, options || {})
      .toArray();
  }

  findAll(db, options) {
    return db
      .collection(this.collection)
      .find({}, options || {})
      .toArray();
  }

  deleteOne(db, filter) {
    return db.collection(this.collection).deleteOne(filter);
  }

  deleteMany(db, filter) {
    return db.collection(this.collection).deleteMany(filter);
  }

  insertOne(db, data) {
    const { error, value } = this.schema.validate(data);
    if (error) {
      console.log(
        '==> Schema validation failed: ' + this.collection + ' => ' + error + '; Data => ' + JSON.stringify(data)
      );
      throw error;
    }
    return db.collection(this.collection).insertOne(data);
  }
}
