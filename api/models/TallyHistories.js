'use strict';

import Model from './Model';

import { tallyHistory } from './schema';

class TallyHistories extends Model {
  constructor() {
    super('tallyhistories', tallyHistory);
    this.schema = tallyHistory;
  }

  findForAcct(db, acctId) {
    return this.find(db, { 'account.id': acctId }, { projection: { _id: 0 }, sort: { id: -1 } });
  }
}

export default function () {
  return new TallyHistories();
}
