'use strict';

import { PIPE, STATE, publish } from 'bin/socket-handler';
import { COLLECTION } from 'config/constants';

import { Model } from 'data/models/Model';
import { AccountType } from 'data/models/schema';

class AccountModel extends Model {
  constructor() {
    super(COLLECTION.ACCOUNT, AccountType);
    this.schema = AccountType;
  }

  findForCity(db, cityId, active) {
    let filter = { cityId: cityId };
    filter = active ? { ...filter, active: true } : filter;
    return this.find(db, filter, { sort: { seq: 1 } });
  }

  findById(db, id) {
    return super.findOne(db, { id: id });
  }

  findOneAndUpdate(db, filter, mod, options) {
    const promise = super.findOneAndUpdate(db, filter, mod, options);
    this._publish(db, filter.id, STATE.UPDATED, promise);
    return promise;
  }

  insertOne(db, data) {
    const promise = super.insertOne(db, data);
    this._publish(db, data.id, STATE.CREATED, promise);
    return promise;
  }

  async _publish(db, id, state, promise) {
    await promise;
    const acct = state === STATE.DELETED ? { id: id } : await this.findById(db, id);
    publish(PIPE.ACCOUNT, acct, state);
  }
}

export const accountModel = new AccountModel();
