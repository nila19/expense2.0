'use strict';

import moment from 'moment';

import config from 'config/config';
import { FORMAT } from 'config/formats';
import { Model } from 'data/models/Model';
import { SummaryType } from 'data/models/schema';

class SummaryModel extends Model {
  constructor() {
    super('summaries', SummaryType);
    this.schema = SummaryType;
  }

  findForCity(db, cityId, regular, adhoc) {
    const filter = { cityId };
    if (!(regular && adhoc)) {
      filter.adhoc = adhoc;
    }
    return super.find(db, filter);
  }

  findForForecast(db, cityId) {
    const beginPeriod = config.forecastMonths + 1;
    const thisMonth = moment().date(1);
    const beginMth = thisMonth.clone().subtract(beginPeriod, 'months').format(FORMAT.YYYYMMDD);
    const endMth = thisMonth.clone().subtract(1, 'months').format(FORMAT.YYYYMMDD);
    const filter = { cityId, adhoc: false, transMonth: { $gt: beginMth, $lte: endMth } };
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
