'use strict';

import Model from './Model';

import { TallyHistoryType } from './schema';

class TallyHistory extends Model {
  constructor() {
    super('tallyhistories', TallyHistoryType);
    this.schema = TallyHistoryType;
  }

  findForAcct(db, acctId) {
    return this.find(db, { 'account.id': acctId }, { projection: { _id: 0 }, sort: { id: -1 } });
  }
}

export default function () {
  return new TallyHistory();
}
