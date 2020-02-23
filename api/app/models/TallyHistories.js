'use strict';

const Model = require('./Model');
const schema = {
  id: 'int not-null primarykey autoincrement',
  cityId: 'int not-null',
  account: {id: 'int not-null', name: 'string'},
  tallyDt: 'date',
  balance: 'float',
};

class TallyHistories extends Model {
  constructor() {
    super('tallyhistories');
    this.schema = schema;
  }
  findForAcct(db, acctId) {
    return super.find(db, {'account.id': acctId}, {fields: {_id: 0}, sort: {id: -1}});
  }
}

module.exports = function () {
  return new TallyHistories();
};
