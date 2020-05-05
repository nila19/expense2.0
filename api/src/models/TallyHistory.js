'use strict';

import { Model } from 'models/Model';
import { TallyHistoryType } from 'models/schema';

class TallyHistoryModel extends Model {
  constructor() {
    super('tallyhistories', TallyHistoryType);
    this.schema = TallyHistoryType;
  }

  findForAcct(db, acctId) {
    return this.find(db, { 'account.id': acctId }, { projection: { _id: 0 }, sort: { id: -1 } });
  }
}

export const tallyHistoryModel = new TallyHistoryModel();
