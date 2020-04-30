/* eslint no-magic-numbers: "off"*/

'use strict';

import _ from 'lodash';
import moment from 'moment';

import Model from './Model';
import config from '../config/config';
import format from '../config/formats';

import { publish, PIPE, STATE } from '../bin/socket-handler';

import { TransactionType } from './schema';

const searchUI = {
  cityId: 'int',
  acctId: 'int',
  billId: 'int',
  catId: 'int',
  description: 'string',
  amount: 'float',
  adhoc: 'string default-N',
  adjust: 'string default-N',
  entryMonth: 'date',
  entryYear: 'boolean',
  transMonth: 'date',
  transYear: 'boolean',
  thinList: 'boolean',
};

class Transaction extends Model {
  constructor() {
    super('transactions', TransactionType);
    this.schema = TransactionType;
    this.searchUI = searchUI;
  }

  findForCity(db, cityId) {
    return this.find(db, { cityId: cityId }, { projection: { _id: 0 }, sort: { seq: -1 } });
  }

  findForAcct(db, cityId, acctId, billId) {
    const filter = { cityId: cityId };
    if (billId) {
      filter['bill.id'] = billId;
    } else {
      filter.$or = [{ 'accounts.from.id': acctId }, { 'accounts.to.id': acctId }];
    }
    return this.find(db, filter, { projection: { _id: 0 }, sort: { seq: -1 } });
  }

  findPrevious(db, cityId, acctId, seq) {
    const filter = { cityId: cityId, seq: { $lt: seq } };
    filter.$or = [{ 'accounts.from.id': acctId }, { 'accounts.to.id': acctId }];
    return this.findOne(db, filter, { projection: { _id: 0 }, sort: { seq: -1 } });
  }

  findForMonthlySummary(db, cityId, regular, adhoc) {
    const filter = { cityId: cityId, adjust: false };
    if (!(regular && adhoc)) {
      filter.adhoc = regular && !adhoc ? false : true;
    }
    return this.find(db, filter, { projection: { _id: 0 }, sort: { seq: -1 } });
  }

  // get Transactions for the last 3 months excluding the current month.
  findForForecast(db, cityId) {
    const thisMonth = moment().date(1);
    const beginMth = thisMonth.clone().subtract(4, 'months').format(format.YYYYMMDD);
    const endMth = thisMonth.clone().subtract(1, 'months').format(format.YYYYMMDD);
    const filter = {
      cityId: cityId,
      adhoc: false,
      adjust: false,
      transMonth: { $gt: beginMth, $lte: endMth },
    };
    return this.find(db, filter, { projection: { _id: 0 }, sort: { seq: -1 } });
  }

  findAllEntryMonths(db, cityId) {
    return this.distinct(db, 'entryMonth', { cityId: cityId }, { projection: { _id: 0 }, sort: { entryMonth: -1 } });
  }

  findAllTransMonths(db, cityId) {
    return this.distinct(db, 'transMonth', { cityId: cityId }, { projection: { _id: 0 }, sort: { transMonth: -1 } });
  }

  findAllDescriptions(db, cityId) {
    const criteria = [
      { $match: { cityId: cityId } },
      { $group: { _id: '$description', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];
    return this.aggregate(db, criteria);
  }

  findForSearch(db, qry) {
    const options = { projection: { _id: 0 }, sort: { seq: -1 } };
    let filter = { cityId: _.toNumber(qry.cityId) };
    filter = this.buildSearchQueryOne(qry, filter);
    filter = this.buildSearchQueryTwo(qry, filter);
    // thin list
    if (qry.thinList === 'true') {
      options.limit = config.thinList;
    }
    return this.find(db, filter, options);
  }

  // internal utility methods...
  buildSearchQueryOne(qry, filter) {
    // account id
    if (qry.acctId) {
      filter.$or = [{ 'accounts.from.id': _.toNumber(qry.acctId) }, { 'accounts.to.id': _.toNumber(qry.acctId) }];
    }
    // bill id
    if (qry.billId) {
      filter['bill.id'] = _.toNumber(qry.billId);
    }
    // category id
    if (qry.catId) {
      filter['category.id'] = _.toNumber(qry.catId);
    }
    // description
    if (qry.description) {
      filter.description = { $regex: new RegExp(qry.description, 'gi') };
    }
    // amount
    if (qry.amount) {
      const amt75 = _.toNumber(qry.amount) * config.pct75;
      const amt125 = _.toNumber(qry.amount) * config.pct125;
      filter.$and = [{ amount: { $gt: amt75 } }, { amount: { $lt: amt125 } }];
    }
    // adhoc ind
    if (qry.adhoc) {
      filter.adhoc = qry.adhoc === 'Y';
    }
    // adjust ind
    if (qry.adjust) {
      filter.adjust = qry.adjust === 'Y';
    }
    return filter;
  }

  buildSearchQueryTwo(qry, filter) {
    // entry month
    if (qry.entryMonth) {
      const entry = moment(qry.entryMonth);
      if (qry.entryYear == 'true') {
        // set startDt as 31-Dec of previous year, since that it is > than.
        // set endDt as 1-Jan of next year, since that it is > than.
        const yearBegin = entry.clone().month(0).date(0).format(format.YYYYMMDD);
        const yearEnd = entry.clone().month(11).date(31).format(format.YYYYMMDD);
        filter.$and = [{ entryMonth: { $gt: yearBegin } }, { entryMonth: { $lt: yearEnd } }];
      } else {
        filter.entryMonth = entry.format(format.YYYYMMDD);
      }
    }
    // trans month
    if (qry.transMonth) {
      const trans = moment(qry.transMonth);
      if (qry.transYear == 'true') {
        // set startDt as 31-Dec of previous year, since that it is > than.
        const yearBegin = trans.clone().month(0).date(0).format(format.YYYYMMDD);
        const yearEnd = trans.clone().month(11).date(31).format(format.YYYYMMDD);
        filter.$and = [{ transMonth: { $gt: yearBegin } }, { transMonth: { $lt: yearEnd } }];
      } else {
        filter.transMonth = trans.format(format.YYYYMMDD);
      }
    }
    return filter;
  }

  insertOne(db, data) {
    const promise = super.insertOne(db, data);
    this._publish(db, data.id, STATE.CREATED, promise);
    return promise;
  }

  deleteOne(db, filter) {
    const promise = super.deleteOne(db, filter);
    this._publish(db, filter.id, STATE.DELETED, promise);
    return promise;
  }

  updateOne(db, filter, mod, options) {
    const promise = super.updateOne(db, filter, mod, options);
    this._publish(db, filter.id, STATE.UPDATED, promise);
    return promise;
  }

  updateTrans(db, trans) {
    const filter = { cityId: trans.cityId, id: trans.id };
    const mod = {
      $set: {
        category: trans.category,
        description: trans.description,
        amount: trans.amount,
        transDt: trans.transDt,
        transMonth: trans.transMonth,
        adhoc: trans.adhoc,
        adjust: trans.adjust,
        tallied: trans.tallied,
        tallyDt: trans.tallyDt,
        accounts: trans.accounts,
      },
    };
    if (trans.bill) {
      mod.$set.bill = trans.bill;
    } else {
      mod.$unset = { bill: '' };
    }
    const promise = super.updateOne(db, filter, mod);
    this._publish(db, filter.id, STATE.UPDATED, promise);
    return promise;
  }

  // internal methods
  async _publish(db, id, state, promise) {
    await promise;
    const trans = await this.findById(db, id);
    publish(PIPE.TRANS, trans, state);
  }
}

export default function () {
  return new Transaction();
}
