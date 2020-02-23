'use strict';

const Model = require('./Model');

const schema = {
  id: 'int not-null primarykey',
  name: 'string',
  active: 'boolean',
  default: 'boolean',
  currency: 'string default-USD',
  startDt: 'date',
  endDt: 'date'
};

class Cities extends Model {
  constructor() {
    super('cities');
    this.schema = schema;
  }
  findAllCities(db) {
    return super.findAll(db, {fields: {_id: 0}, sort: {startDt: -1}});
  }
  findActive(db) {
    return super.find(db, {active: true}, {fields: {_id: 0}, sort: {startDt: -1}});
  }
  findDefault(db) {
    return super.findOne(db, {default: true});
  }
}

module.exports = function () {
  return new Cities();
};
