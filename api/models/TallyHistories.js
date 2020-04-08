'use strict';

import Model from './Model';

const schema = {
  id: 'int not-null primarykey autoincrement',
  cityId: 'int not-null',
  account: { id: 'int not-null', name: 'string' },
  tallyDt: 'date',
  balance: 'float',
};

class TallyHistories extends Model {
  constructor() {
    super('tallyhistories', schema);
    this.schema = schema;
  }

  findForAcct(db, acctId) {
    return this.find(db, { 'account.id': acctId }, { projection: { _id: 0 }, sort: { id: -1 } });
  }
}

export default function () {
  return new TallyHistories();
}
