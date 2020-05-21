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

  findForCity(db, cityId) {
    return this.find(db, { cityId: cityId, active: true }, { sort: { seq: 1 } });
  }

  findById(db, id) {
    return super.findOne(db, { id: id });
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
