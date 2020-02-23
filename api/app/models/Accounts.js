'use strict';

const Promise = require('bluebird');
const bills = require('../models/Bills')();
const socket = require('../bin/socket-handler');

const Model = require('./Model');
const schema = {
  id: 'int not-null primarykey autoincrement',
  cityId: 'int not-null',
  name: 'string not-null',
  balance: 'float default-0',
  cash: 'boolean',
  active: 'boolean',
  billed: 'boolean',
  icon: 'string default-home',
  color: 'string default-blue',
  seq: 'int',
  tallyBalance: 'float',
  tallyDt: 'timestamp',
  closingDay: 'int',
  dueDay: 'int',
  bills: {
    last: {id: 'int', name: 'string'},
    open: {id: 'int', name: 'string'}
  }
};

class Accounts extends Model {
  constructor() {
    super('accounts');
    this.schema = schema;
  }
  findForCity(db, cityId) {
    const vm = this;

    return new Promise(function (resolve, reject) {
      const promises = [];
      let accts = null;

      vm.find(db, {cityId: cityId, active: true}, {fields: {_id: 0}, sort: {seq: 1}}).then((acs) => {
        accts = acs;
        accts.forEach(function (acct) {
          promises.push(vm.injectLastBill(db, acct));
          promises.push(vm.injectOpenBill(db, acct));
        });
        return Promise.all(promises);
      }).then(() => {
        return resolve(accts);
      }).catch((err) => {
        return reject(err);
      });
    });
  }
  findForCityThin(db, cityId) {
    return super.find(db, {cityId: cityId},
      {fields: {_id: 0, id: 1, name: 1, active: 1, billed: 1, cash: 1}, sort: {active: -1, seq: 1}});
  }
  findBillable(db, cityId) {
    return super.find(db, {cityId: cityId, active: true, billed: true}, {fields: {_id: 0}, sort: {seq: 1}});
  }
  update(db, filter, mod, options) {
    const promise = super.update(db, filter, mod, options);

    this.publish(db, filter.id, promise);
    return promise;
  }
  // utility method
  publish(db, id, promise) {
    promise.then(() => {
      return this.findById(db, id);
    }).then((acc) => {
      socket.publish(socket.PIPE.ACCOUNT, acc);
    });
  }
  findById(db, id) {
    const vm = this;

    return new Promise(function (resolve, reject) {
      let acct = null;

      vm.findOne(db, {id: id}).then((ac) => {
        acct = ac;
        const promises = [];

        promises.push(vm.injectLastBill(db, acct));
        promises.push(vm.injectOpenBill(db, acct));
        return Promise.all(promises);
      }).then(() => {
        return resolve(acct);
      }).catch((err) => {
        return reject(err);
      });
    });
  }
  // internal methods
  injectLastBill(db, acct) {
    return new Promise(function (resolve, reject) {
      if(!acct.billed || !acct.bills.last || !acct.bills.last.id) {
        return resolve(acct);
      }
      bills.findById(db, acct.bills.last.id).then((bill) => {
        acct.bills.last = bill;
        return resolve(acct);
      }).catch((err) => {
        return reject(err);
      });
    });
  }
  injectOpenBill(db, acct) {
    return new Promise(function (resolve, reject) {
      if(!acct.billed || !acct.bills.open || !acct.bills.open.id) {
        return resolve(acct);
      }
      bills.findById(db, acct.bills.open.id).then((bill) => {
        acct.bills.open = bill;
        return resolve(acct);
      }).catch((err) => {
        return reject(err);
      });
    });
  }
}

module.exports = function () {
  return new Accounts();
};
