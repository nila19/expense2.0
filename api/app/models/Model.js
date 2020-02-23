'use strict';

class Model {
  constructor(collection) {
    this.collection = collection;
  }
  findById(db, id) {
    return db.get(this.collection).findOne({id: id}, {fields: {_id: 0}});
  }
  findOne(db, filter, options) {
    return db.get(this.collection).findOne(filter, options || {fields: {_id: 0}});
  }
  findOneAndUpdate(db, filter, mod, options) {
    return db.get(this.collection).findOneAndUpdate(filter, mod, options || {fields: {_id: 0}, returnOriginal: false});
  }
  find(db, filter, options) {
    return db.get(this.collection).find(filter, options || {fields: {_id: 0}});
  }
  findAll(db, options) {
    return db.get(this.collection).find({}, options || {fields: {_id: 0}});
  }
  distinct(db, field, filter, options) {
    return db.get(this.collection).distinct(field, filter || {}, options || {fields: {_id: 0}});
  }
  remove(db, filter) {
    return db.get(this.collection).remove(filter);
  }
  insert(db, data) {
    return db.get(this.collection).insert(data);
  }
  update(db, filter, mod, options) {
    let opt = {multi: true, upsert: true};

    // embed the multi/upsert options based on input options.
    opt = options ? Object.assign({}, opt, options) : opt;
    return db.get(this.collection).update(filter, mod, opt);
  }
}

module.exports = Model;
