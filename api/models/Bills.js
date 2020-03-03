'use strict';

import Model from './Model';

import { publish as _publish, PIPE } from '../bin/socket-handler';

const schema = {
  id: 'int not-null primarykey autoincrement',
  name: 'string',
  cityId: 'int not-null',
  account: { id: 'int not-null', name: 'string' },
  createdDt: 'timestamp',
  billDt: 'date',
  dueDt: 'date',
  closed: 'boolean',
  amount: 'float',
  balance: 'float',
  payments: [{ id: 'int', transDt: 'date', amount: 'float' }]
};

class Bills extends Model {
  constructor() {
    super('bills', schema);
    this.schema = schema;
  }

  // paid = null, get all;
  // paid = 'N', getUnpaid only,
  // paid = 'Y', getPaid only
  findForCity(db, cityId, paid) {
    const filter = { cityId: cityId, closed: true };
    if (paid) {
      filter.balance = paid === 'Y' ? 0 : { $gt: 0 };
    }
    return this.find(db, filter, { fields: { _id: 0 }, sort: { billDt: -1 } });
  }

  // paid = null, get all (including 'open', for modify dropdown);
  // paid = 'N', getUnpaid only,
  // paid = 'Y', getPaid only
  findForAcct(db, acctId, paid) {
    const filter = { 'account.id': acctId };
    if (paid) {
      filter.balance = paid === 'Y' ? 0 : { $gt: 0 };
      filter.closed = true;
    }
    return this.find(db, filter, { fields: { _id: 0 }, sort: { billDt: -1 } });
  }

  // used by billCloser
  findForCityOpen(db, cityId) {
    return this.find(db, { cityId: cityId, closed: false }, { fields: { _id: 0 }, sort: { billDt: -1 } });
  }

  findOneAndUpdate(db, filter, mod, options) {
    const promise = super.findOneAndUpdate(db, filter, mod, options);
    this.publish(db, filter.id, promise);
    return promise;
  }

  update(db, filter, mod, options) {
    const promise = super.update(db, filter, mod, options);
    this.publish(db, filter.id, promise);
    return promise;
  }

  // utility method
  publish(db, id, promise) {
    promise
      .then(() => {
        return this.findById(db, id);
      })
      .then(bill => {
        _publish(PIPE.BILL, bill);
      });
  }

  // utility method
  getName(acct, bill) {
    return bill.id ? acct.name + ' : ' + bill.billDt + ' #' + bill.id : acct.name + ' #0';
  }
}

export default function() {
  return new Bills();
}
