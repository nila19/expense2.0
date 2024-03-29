'use strict';

import moment from 'moment';

import { config } from 'config/config';
import { COLLECTION, FORMAT } from 'config/constants';

import { Model } from 'data/models/Model';
import { SummaryType } from 'data/models/schema';

class SummaryModel extends Model {
  constructor() {
    super(COLLECTION.SUMMARY, SummaryType);
    this.schema = SummaryType;
  }

  findForCity(db, cityId, regular, adhoc, recurring, nonRecurring) {
    let filter = { cityId };
    if (!(regular && adhoc)) {
      filter.adhoc = adhoc;
    }
    if (!(recurring && nonRecurring)) {
      if (recurring) {
        filter.recurring = recurring;
      } else {
        filter = { ...filter, $or: [{ recurring: { $exists: false } }, { recurring: { $eq: false } }] };
      }
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

  incrementOrInsert(db, cityId, category, transMonth, adhoc, recurring, amount) {
    const filter = { cityId, category, transMonth, adhoc, recurring };
    const mod = {
      $inc: { count: 1, amount: amount },
      $set: { cityId, category, transMonth, adhoc, recurring },
    };
    return super.updateOne(db, filter, mod, { upsert: true });
  }

  decrement(db, cityId, category, transMonth, adhoc, recurring, amount) {
    const filter = { cityId, category, transMonth, adhoc, recurring };
    const mod = { $inc: { count: -1, amount: -amount } };
    return super.updateOne(db, filter, mod);
  }
}

export const summaryModel = new SummaryModel();
