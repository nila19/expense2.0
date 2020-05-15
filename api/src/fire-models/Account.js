'use strict';

import { Model } from 'fire-models/Model';

class AccountModel extends Model {
  constructor() {
    super('accounts', null);
    this.schema = null;
  }
}

export const accountModel = new AccountModel();
