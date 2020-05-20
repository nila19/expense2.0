/* eslint no-magic-numbers: "off"*/

'use strict';

import { PIPE, STATE, publish } from 'bin/socket-handler';
import config from 'config/config';
import { COLLECTION } from 'config/constants';
import { Model } from 'data/models/Model';
import { TransactionType } from 'data/models/schema';

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

const options = { sort: { seq: -1 } };
const acctIdFilter = (acctId) => ({ $or: [{ 'accounts.from.id': acctId }, { 'accounts.to.id': acctId }] });

class TransactionModel extends Model {
  constructor() {
    super(COLLECTION.TRANSACTION, TransactionType);
    this.schema = TransactionType;
    this.searchForm = searchForm;
  }

  findForCity(db, cityId) {
    return this.find(db, { cityId }, options);
  }

  findForAcct(db, cityId, acctId) {
    const filter = { cityId, ...acctIdFilter(acctId) };
    return this.find(db, filter, options);
  }

  findNotTallied(db, cityId, acctId) {
    const filter = { cityId, ...acctIdFilter(acctId), tallied: false };
    return this.find(db, filter, options);
  }

  findForBill(db, cityId, billId) {
    const filter = { cityId, 'bill.id': billId };
    return this.find(db, filter, options);
  }

  findPrevious(db, cityId, acctId, seq) {
    const filter = { cityId, ...acctIdFilter(acctId), seq: { $lt: seq } };
    return this.findOne(db, filter, options);
  }

  findForMonthlySummary(db, cityId, regular, adhoc) {
    const filter = { cityId, adjust: false };
    if (!(regular && adhoc)) {
      filter.adhoc = regular && !adhoc ? false : true;
    }
    return this.find(db, filter, options);
  }

  findForSearch(db, filter, allRecords) {
    const limit = !allRecords || allRecords !== true ? { limit: config.thinList } : {};
    return this.find(db, filter, { ...options, ...limit });
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

  findOneAndUpdate(db, filter, mod, _options) {
    const promise = super.findOneAndUpdate(db, filter, mod, _options);
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
