'use strict';

import { Model } from 'data/fire-models/Model';

class AccountModel extends Model {
  constructor() {
    super('accounts', false, null);
    this.schema = null;
  }
}

export const accountModel = new AccountModel();
