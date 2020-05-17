/* eslint no-magic-numbers: "off"*/

'use strict';

import _ from 'lodash';
import moment from 'moment';

import { PIPE, STATE, publish } from 'bin/socket-handler';
import config from 'config/config';
import { FORMAT } from 'config/formats';
import { Model } from 'models/Model';
import { TransactionType } from 'models/schema';

const searchForm = {
  cityId: 'int',
  account: { id: 'int' },
  bill: { id: 'int' },
  category: { id: 'int' },
  description: 'string',
  amount: 'float',
  adhoc: 'string default-N',
  adjust: 'string default-N',
  entryMonth: { id: 'date', year: 'boolean' },
  transMonth: { id: 'date', year: 'boolean' },
  allRecords: 'boolean',
};

class TransactionModel extends Model {
  constructor() {
    super('transactions', TransactionType);
    this.schema = TransactionType;
    this.searchForm = searchForm;
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
    const beginMth = thisMonth.clone().subtract(4, 'months').format(FORMAT.YYYYMMDD);
    const endMth = thisMonth.clone().subtract(1, 'months').format(FORMAT.YYYYMMDD);
    const filter = {
      cityId: cityId,
      adhoc: false,
      adjust: false,
      transMonth: { $gt: beginMth, $lte: endMth },
    };
    return this.find(db, filter, { projection: { _id: 0 }, sort: { seq: -1 } });
  }

  findForSearch(db, data) {
    const options = { projection: { _id: 0 }, sort: { seq: -1 } };
    let filter = { cityId: _.toNumber(data.cityId) };
    filter = this.buildSearchQueryOne(data, filter);
    filter = this.buildSearchQueryTwo(data, filter);
    // thin list
    if (!data.allRecords || data.allRecords !== true) {
      options.limit = config.thinList;
    }
    return this.find(db, filter, options);
  }

  buildSearchQueryOne(data, filter) {
    if (data.account && data.account.id) {
      filter.$or = [
        { 'accounts.from.id': _.toNumber(data.account.id) },
        { 'accounts.to.id': _.toNumber(data.account.id) },
      ];
    }
    if (data.bill && data.bill.id) {
      filter['bill.id'] = _.toNumber(data.bill.id);
    }
    if (data.category && data.category.id) {
      filter['category.id'] = _.toNumber(data.category.id);
    }
    if (data.description) {
      filter.description = { $regex: new RegExp(data.description, 'gi') };
    }
    if (data.amount) {
      const amt75 = _.toNumber(data.amount) * config.pct75;
      const amt125 = _.toNumber(data.amount) * config.pct125;
      filter.$and = [{ amount: { $gt: amt75 } }, { amount: { $lt: amt125 } }];
    }
    if (data.adhoc) {
      filter.adhoc = data.adhoc === 'Y';
    }
    if (data.adjust) {
      filter.adjust = data.adjust === 'Y';
    }
    return filter;
  }

  buildSearchQueryTwo(data, filter) {
    if (data.entryMonth && data.entryMonth.id) {
      const entry = moment(data.entryMonth.id);
      if (data.entryMonth.year === true) {
        // set startDt as 31-Dec of previous year, since that it is > than.
        // set endDt as 1-Jan of next year, since that it is > than.
        const yearBegin = entry.clone().month(0).date(0).format(FORMAT.YYYYMMDD);
        const yearEnd = entry.clone().month(11).date(31).format(FORMAT.YYYYMMDD);
        filter.$and = [{ entryMonth: { $gt: yearBegin } }, { entryMonth: { $lt: yearEnd } }];
      } else {
        filter.entryMonth = entry.format(FORMAT.YYYYMMDD);
      }
    }
    if (data.transMonth && data.transMonth.id) {
      const trans = moment(data.transMonth.id);
      if (data.transMonth.year === true) {
        // set startDt as 31-Dec of previous year, since that it is > than.
        const yearBegin = trans.clone().month(0).date(0).format(FORMAT.YYYYMMDD);
        const yearEnd = trans.clone().month(11).date(31).format(FORMAT.YYYYMMDD);
        filter.$and = [{ transMonth: { $gt: yearBegin } }, { transMonth: { $lt: yearEnd } }];
      } else {
        filter.transMonth = trans.format(FORMAT.YYYYMMDD);
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

  findOneAndUpdate(db, filter, mod, options) {
    const promise = super.findOneAndUpdate(db, filter, mod, options);
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
    const promise = super.findOneAndUpdate(db, filter, mod);
    this._publish(db, filter.id, STATE.UPDATED, promise);
    return promise;
  }

  // internal methods
  async _publish(db, id, state, promise) {
    await promise;
    const trans = state === STATE.DELETED ? { id: id } : await this.findById(db, id);
    publish(PIPE.TRANS, trans, state);
  }
}

export const transactionModel = new TransactionModel();
