'use strict';

import { PIPE, STATE, publish } from 'bin/socket-handler';
import { Model } from 'models/Model';
import { billModel } from 'models/Bill';
import { AccountType } from 'models/schema';

class AccountModel extends Model {
  constructor() {
    super('accounts', AccountType);
    this.schema = AccountType;
  }

  findForCity(db, cityId) {
    return this.find(db, { cityId: cityId, active: true }, { projection: { _id: 0 }, sort: { seq: 1 } });
  }

  async findById(db, id) {
    const acct = await this.findOne(db, { id: id });
    await this._injectLastBill(db, acct);
    await this._injectOpenBill(db, acct);
    return acct;
  }

  async _injectLastBill(db, acct) {
    if (acct.billed && acct.bills.last && acct.bills.last.id) {
      acct.bills.last = await billModel.findById(db, acct.bills.last.id);
    }
  }

  async _injectOpenBill(db, acct) {
    if (acct.billed && acct.bills.open && acct.bills.open.id) {
      acct.bills.open = await billModel.findById(db, acct.bills.open.id);
    }
  }

  findOneAndUpdate(db, filter, mod, options) {
    const promise = super.findOneAndUpdate(db, filter, mod, options);
    this._publish(db, filter.id, STATE.UPDATED, promise);
    return promise;
  }

  async _publish(db, id, state, promise) {
    await promise;
    const acct = state === STATE.DELETED ? { id: id } : await this.findById(db, id);
    publish(PIPE.ACCOUNT, acct, state);
  }
}

export const accountModel = new AccountModel();
