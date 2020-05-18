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
    return this.find(db, { cityId }, { sort: { seq: -1 } });
  }

  findForAcct(db, cityId, acctId) {
    const filter = { cityId };
    filter.$or = [{ 'accounts.from.id': acctId }, { 'accounts.to.id': acctId }];
    return this.find(db, filter, { sort: { seq: -1 } });
  }

  findNotTallied(db, cityId, acctId) {
    const filter = { cityId, tallied: false };
    filter.$or = [{ 'accounts.from.id': acctId }, { 'accounts.to.id': acctId }];
    return this.find(db, filter, { sort: { seq: -1 } });
  }

  findForBill(db, cityId, billId) {
    const filter = { cityId, bill: { id: billId } };
    return this.find(db, filter, { sort: { seq: -1 } });
  }

  findPrevious(db, cityId, acctId, seq) {
    const filter = { cityId, seq: { $lt: seq } };
    filter.$or = [{ 'accounts.from.id': acctId }, { 'accounts.to.id': acctId }];
    return this.findOne(db, filter, { sort: { seq: -1 } });
  }

  findForMonthlySummary(db, cityId, regular, adhoc) {
    const filter = { cityId, adjust: false };
    if (!(regular && adhoc)) {
      filter.adhoc = regular && !adhoc ? false : true;
    }
    return this.find(db, filter, { sort: { seq: -1 } });
  }

  findForSearch(db, filter, allRecords) {
    const options = { sort: { seq: -1 } };
    if (!allRecords || allRecords !== true) {
      options.limit = config.thinList;
    }
    return this.find(db, filter, options);
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
        transYear: trans.transYear,
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
