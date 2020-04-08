'use strict';

import Model from './Model';
import Bills from '../models/Bills';

import { publish, PIPE } from '../bin/socket-handler';

const bills = Bills();

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
    last: { id: 'int', name: 'string' },
    open: { id: 'int', name: 'string' },
  },
};

class Accounts extends Model {
  constructor() {
    super('accounts', schema);
    this.schema = schema;
  }

  async findForCity(db, cityId) {
    const accts = await this.find(db, { cityId: cityId, active: true }, { projection: { _id: 0 }, sort: { seq: 1 } });
    for (const acct of accts) {
      await this._injectLastBill(db, acct);
      await this._injectOpenBill(db, acct);
    }
    return accts;
  }

  findForCityThin(db, cityId) {
    return this.find(
      db,
      { cityId: cityId },
      {
        projection: { _id: 0, id: 1, name: 1, active: 1, billed: 1, cash: 1 },
        sort: { active: -1, seq: 1 },
      }
    );
  }

  findBillable(db, cityId) {
    return this.find(db, { cityId: cityId, active: true, billed: true }, { projection: { _id: 0 }, sort: { seq: 1 } });
  }

  updateOne(db, filter, mod, options) {
    const promise = super.updateOne(db, filter, mod, options);
    this._publish(db, filter.id, promise);
    return promise;
  }

  async findById(db, id) {
    const acct = await this.findOne(db, { id: id });
    await this._injectLastBill(db, acct);
    await this._injectOpenBill(db, acct);
    return acct;
  }

  // internal methods
  async _publish(db, id, promise) {
    await promise;
    const acct = await this.findById(db, id);
    publish(PIPE.ACCOUNT, acct);
  }

  async _injectLastBill(db, acct) {
    if (acct.billed && acct.bills.last && acct.bills.last.id) {
      acct.bills.last = await bills.findById(db, acct.bills.last.id);
    }
  }

  async _injectOpenBill(db, acct) {
    if (acct.billed && acct.bills.open && acct.bills.open.id) {
      acct.bills.open = await bills.findById(db, acct.bills.open.id);
    }
  }
}

export default function () {
  return new Accounts();
}
