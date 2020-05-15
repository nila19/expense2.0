'use strict';

import _ from 'lodash';

export class Model {
  constructor(collection, schema) {
    this.collection = collection;
    this.schema = schema;
  }

  async findAll(db) {
    const records = await db.collection(this.collection).get();
    return this.extract(records);
  }

  async find(db, wheres) {
    let query = db.collection(this.collection);
    wheres.forEach((e) => {
      query = query.where(e[0], e[1], e[2]);
    });

    const records = await query.get();
    return this.extract(records);
  }

  extract(records) {
    return records.docs.map((e) => ({ _id: e.id, ...e.data() }));
  }
}
