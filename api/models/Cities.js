'use strict';

import Model from './Model';

const schema = {
  id: 'int not-null primarykey',
  name: 'string',
  active: 'boolean',
  default: 'boolean',
  currency: 'string default-USD',
  startDt: 'date',
  endDt: 'date',
};

class Cities extends Model {
  constructor() {
    super('cities', schema);
    this.schema = schema;
  }

  findAllCities(db) {
    return this.findAll(db, { projection: { _id: 0 }, sort: { startDt: -1 } });
  }

  findActive(db) {
    return this.find(db, { active: true }, { projection: { _id: 0 }, sort: { startDt: -1 } });
  }

  findDefault(db) {
    return this.findOne(db, { default: true });
  }
}

export default function () {
  return new Cities();
}
