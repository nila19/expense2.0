'use strict';

import { COLLECTION } from 'config/formats';
import { Model } from 'data/models/Model';
import { TallyHistoryType } from 'data/models/schema';

class TallyHistoryModel extends Model {
  constructor() {
    super(COLLECTION.TALLY, TallyHistoryType);
    this.schema = TallyHistoryType;
  }

  findForAcct(db, acctId) {
    return this.find(db, { 'account.id': acctId }, { sort: { id: -1 } });
  }
}

export const tallyHistoryModel = new TallyHistoryModel();
