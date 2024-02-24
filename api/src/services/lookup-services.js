'use strict';

import { MONTH_TYPE } from 'config/constants';

import { descriptionModel, monthModel, summaryModel } from 'data/models';

export const addToLookups = async (db, tran) => {
  await descriptionModel.incrementOrInsert(db, tran.cityId, tran.description);
  await monthModel.incrementOrInsert(db, tran.cityId, MONTH_TYPE.ENTRY, tran.entryMonth);
  await monthModel.incrementOrInsert(db, tran.cityId, MONTH_TYPE.TRANS, tran.transMonth);
  if (!tran.adjust && tran.category?.id) {
    const category = { id: tran.category.id, name: tran.category.name };
    await summaryModel.incrementOrInsert(
      db,
      tran.cityId,
      category,
      tran.transMonth,
      tran.adhoc,
      tran.recurring,
      tran.amount
    );
  }
};

export const removeFromLookups = async (db, tran) => {
  await descriptionModel.decrement(db, tran.cityId, tran.description);
  await monthModel.decrement(db, tran.cityId, MONTH_TYPE.ENTRY, tran.entryMonth);
  await monthModel.decrement(db, tran.cityId, MONTH_TYPE.TRANS, tran.transMonth);
  if (!tran.adjust && tran.category?.id) {
    const category = { id: tran.category.id, name: tran.category.name };
    await summaryModel.decrement(db, tran.cityId, category, tran.transMonth, tran.adhoc, tran.recurring, tran.amount);
  }
};
