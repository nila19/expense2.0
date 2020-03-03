'use strict';

import Model from './Model';

const schema = {
  id: 'int not-null primarykey autoincrement',
  name: 'string',
  cityId: 'int not-null',
  mainDesc: 'string default-NA',
  subDesc: 'string default-NA',
  icon: 'string default- ',
  active: 'boolean',
  seq: 'int default-0'
};

class Categories extends Model {
  constructor() {
    super('categories', schema);
    this.schema = schema;
  }

  findForCity(db, cityId) {
    return this.find(db, { cityId: cityId }, { fields: { _id: 0 }, sort: { active: -1, seq: 1 } });
  }
}

export default function() {
  return new Categories();
}
