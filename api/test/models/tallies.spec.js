/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';
import { should, use } from 'chai';

import { tallyhistories } from '../../models/index';

import { ping } from '../../config/mongodb-config.js';

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
      const tls = await tallyhistories.findForAcct(db, acctId);
      tls.map((t) => t.account).should.all.have.property('id', acctId);
    });
  });

  after('close db connection', () => {
    // do nothing.
  });
});
