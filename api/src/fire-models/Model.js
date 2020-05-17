'use strict';

import _ from 'lodash';

export class Model {
  constructor(collection, group, schema) {
    this.collection = collection;
    this.group = group;
    this.schema = schema;
  }

  async insertById(db, id, data) {
    let query = this.getCollection(db);
    await query.doc(id).set(data);
  }

  async updateById(db, id, data, options) {
    let query = this.getCollection(db);
    await query.doc(id).set(data, options || { merge: true });
  }

  async findOneAndUpdate(db, filters, data, options) {
    const item = await this.findOne(db, filters);
    await this.updateById(db, item._id, data, options);
  }

  async deleteById(db, id) {
    let query = this.getCollection(db);
    await query.doc(id).delete();
  }

  async findOneAndDelete(db, filters) {
    const item = await this.findOne(db, filters);
    await query.doc(item._id).delete();
  }

  async findById(db, id) {
    let result = await this.getCollection(db).doc(id);
    return result.data();
  }

  async findOne(db, filters) {
    const items = await this.find(db, filters);
    return items && items.length ? items[0] : null;
  }

  async findAll(db) {
    return await this.find(db, []);
  }

  async find(db, filters, orders, limit) {
    let query = this.getCollection(db);
    if (filters) {
      filters.forEach((e) => {
        query = query.where(e[0], e[1], e[2]);
      });
    }
    if (orders) {
      orders.forEach((e) => {
        query = query.orderBy(e[0], e[1]);
      });
    }
    if (limit) {
      query = query.limit(limit);
    }

    const records = await query.get();
    return this.extract(records);
  }

  getCollection(db) {
    return this.group ? db.collectionGroup(this.collection) : db.collection(this.collection);
  }

  extract(records) {
    return records.docs.map((e) => ({ _id: e.id, ...e.data() }));
  }
}
