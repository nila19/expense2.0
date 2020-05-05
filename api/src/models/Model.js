'use strict';

import _ from 'lodash';

export class Model {
  constructor(collection, schema) {
    this.collection = collection;
    this.schema = schema;
  }

  findById(db, id) {
    return db.collection(this.collection).findOne({ id: id }, { projection: { _id: 0 } });
  }

  findOne(db, filter, options) {
    return db.collection(this.collection).findOne(filter, options || { projection: { _id: 0 } });
  }

  findOneAndUpdate(db, filter, mod, options) {
    return db
      .collection(this.collection)
      .findOneAndUpdate(filter, mod, options || { projection: { _id: 0 }, returnOriginal: false });
  }

  find(db, filter, options) {
    return db
      .collection(this.collection)
      .find(filter, options || { projection: { _id: 0 } })
      .toArray();
  }

  findAll(db, options) {
    return db
      .collection(this.collection)
      .find({}, options || { projection: { _id: 0 } })
      .toArray();
  }

  distinct(db, field, filter, options) {
    return db.collection(this.collection).distinct(field, filter || {}, options || { projection: { _id: 0 } });
  }

  deleteOne(db, filter) {
    return db.collection(this.collection).deleteOne(filter);
  }

  insertOne(db, data) {
    const { error, value } = this.schema.validate(data);
    if (error) {
      console.log('==> Schema validation failed:' + this.collection + ' => ' + error);
      throw error;
    }
    return db.collection(this.collection).insertOne(data);
  }

  aggregate(db, criteria) {
    return db.collection(this.collection).aggregate(criteria).toArray();
  }

  updateOne(db, filter, mod, options) {
    let opt = { multi: true, upsert: true };
    // embed the multi/upsert options based on input options.
    opt = options ? _.assign({}, opt, options) : opt;
    return db.collection(this.collection).updateOne(filter, mod, opt);
  }
}
