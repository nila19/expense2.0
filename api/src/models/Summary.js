'use strict';

import { Model } from 'models/Model';
import { SummaryType } from 'models/schema';

class SummaryModel extends Model {
  constructor() {
    super('summaries', SummaryType);
    this.schema = SummaryType;
  }

  findForCity(db, cityId, adhocFlag) {
    const filter = { cityId: cityId };
    if (adhocFlag) {
      filter['adhoc'] = adhocFlag === 'Y';
    }
    return super.find(db, filter);
  }

  incrementOrInsert(db, cityId, category, transMonth, adhoc, amount) {
    const filter = { cityId, category, transMonth, adhoc };
    const mod = {
      $inc: { count: 1, amount: amount },
      $set: { cityId, category, transMonth, adhoc },
    };
    return super.updateOne(db, filter, mod, { upsert: true });
  }

  decrement(db, cityId, category, transMonth, adhoc, amount) {
    const filter = { cityId, category, transMonth, adhoc };
    const mod = { $inc: { count: -1, amount: -amount } };
    return super.updateOne(db, filter, mod);
  }
}

export const summaryModel = new SummaryModel();
