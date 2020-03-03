/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';
import { should, use } from 'chai';

import TallyHistories from '../../models/TallyHistories';
import { ping } from '../../config/mongodb-config.js';

should();
use(require('chai-things'));

const tallies = TallyHistories();

describe('models.tallies', function() {
  const acctId = 83;
  let db = null;

  before('get db connection', function(done) {
    ping(null, function(err, db1) {
      db = db1;
      done();
    });
  });
  describe('findForAcct', function() {
    it('should fetch all tallies for account', function(done) {
      tallies.findForAcct(db, acctId).then(tls => {
        tls.map(t => t.account).should.all.have.property('id', acctId);
        done();
      });
    });
  });

  after('close db connection', function() {
    // do nothing.
  });
});
