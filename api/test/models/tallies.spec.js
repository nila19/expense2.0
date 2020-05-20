/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';

import { should, use } from 'chai';
import 'regenerator-runtime/runtime.js';

import { ping } from 'config/mongodb-config';
import { tallyHistoryModel } from 'data/models';

should();
use(require('chai-things'));

describe('models.tallyhistories', () => {
  const acctId = 83;
  let db = null;

  before('get db connection', (done) => {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('findForAcct', () => {
    it('should fetch all tallyhistories for account', async () => {
      const tls = await tallyHistoryModel.findForAcct(db, acctId);
      tls.map((t) => t.account).should.all.have.property('id', acctId);
    });
  });

  after('close db connection', () => {
    // do nothing.
  });
});
