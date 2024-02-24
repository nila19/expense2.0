'use strict';

import _ from 'lodash';
import moment from 'moment';

import { config } from 'config/config';
import { FORMAT } from 'config/constants';

import { transactionService } from 'data/services';

export const doSearch = async (db, form) => {
  const filter = buildSearchFilter(form);
  return await transactionService.findForSearch(db, filter, form.allRecords);
};

const buildSearchFilter = (form) => {
  let filter = { cityId: _.toNumber(form.cityId) };
  const filterOne = buildSearchFilterOne(form);
  const filterTwo = buildSearchFilterTwo(form);
  return { ...filter, ...filterOne, ...filterTwo };
};

const buildSearchFilterOne = (form) => {
  const filter = {};
  if (form.account && form.account.id) {
    filter.$or = [
      { 'accounts.from.id': _.toNumber(form.account.id) },
      { 'accounts.to.id': _.toNumber(form.account.id) },
    ];
  }
  if (form.bill && form.bill.id) {
    filter['bill.id'] = _.toNumber(form.bill.id);
  }
  if (form.category && form.category.id) {
    filter['category.id'] = _.toNumber(form.category.id);
  }
  if (form.description) {
    filter.description = { $regex: new RegExp(form.description, 'gi') };
  }
  if (form.amount) {
    const amt75 = _.toNumber(form.amount) * config.pct75;
    const amt125 = _.toNumber(form.amount) * config.pct125;
    filter.$and = [{ amount: { $gt: amt75 } }, { amount: { $lt: amt125 } }];
  }
  if (form.adhoc) {
    filter.adhoc = form.adhoc === 'Y';
  }
  if (form.adjust) {
    filter.adjust = form.adjust === 'Y';
  }
  if (form.recurring) {
    filter.recurring = form.recurring === 'Y';
  }
  return filter;
};

const buildSearchFilterTwo = (form) => {
  const filter = {};
  if (form.entryMonth && form.entryMonth.id) {
    const entry = moment(form.entryMonth.id);
    if (form.entryMonth.year === true) {
      // set startDt as 31-Dec of previous year, since that it is > than.
      // set endDt as 1-Jan of next year, since that it is > than.
      const yearBegin = entry.clone().month(0).date(0).format(FORMAT.YYYYMMDD);
      const yearEnd = entry.clone().month(11).date(31).format(FORMAT.YYYYMMDD);
      filter.$and = [{ entryMonth: { $gt: yearBegin } }, { entryMonth: { $lt: yearEnd } }];
    } else {
      filter.entryMonth = entry.format(FORMAT.YYYYMMDD);
    }
  }
  if (form.transMonth && form.transMonth.id) {
    const trans = moment(form.transMonth.id);
    if (form.transMonth.year === true) {
      // set startDt as 31-Dec of previous year, since that it is > than.
      const yearBegin = trans.clone().month(0).date(0).format(FORMAT.YYYYMMDD);
      const yearEnd = trans.clone().month(11).date(31).format(FORMAT.YYYYMMDD);
      filter.$and = [{ transMonth: { $gt: yearBegin } }, { transMonth: { $lt: yearEnd } }];
    } else {
      filter.transMonth = trans.format(FORMAT.YYYYMMDD);
    }
  }
  return filter;
};
