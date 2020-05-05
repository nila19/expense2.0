'use strict';

import { cityModel } from 'models';

export const checkCityEditable = async (db, id) => {
  const city = await cityModel.findById(db, id);
  if (!city.active) {
    throw new Error('City is not active.');
  }
};

export const checkAccountsActive = (finImpact, from, to) => {
  if (finImpact) {
    if ((from && from.id && !from.active) || (to && to.id && !to.active)) {
      throw new Error('Change invalid. Account(s) involved are not active...');
    }
  }
};
