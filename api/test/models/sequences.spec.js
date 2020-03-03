/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';
import { should, use, expect } from 'chai';

import Sequences from '../../models/Sequences';
import { ping } from '../../config/mongodb-config.js';

should();
use(require('chai-things'));

const sequences = Sequences();

describe('models.sequences', function() {
  const cityId = 20140301;
  const table = 'transactions';
  let db = null;

  before('get db connection', function(done) {
    ping(null, function(err, db1) {
      db = db1;
      done();
    });
  });
  describe('getNextSeq', function() {
    let oldSeq = 0;

    before('backup db values', function(done) {
      sequences.find(db, { cityId: cityId, table: table }).then(s => {
        oldSeq = s[0].seq;
        done();
      });
    });
    it('should get next sequence', function(done) {
      sequences.getNextSeq(db, { cityId: cityId, table: table }).then(seq => {
        expect(seq).to.have.property('seq', oldSeq + 1);
        sequences.getNextSeq(db, { cityId: cityId, table: table }).then(seq => {
          expect(seq).to.have.property('seq', oldSeq + 2);
          done();
        });
      });
    });
    after('restore db values', function(done) {
      sequences.update(db, { cityId: cityId, table: table }, { $set: { seq: oldSeq } }).then(() => {
        done();
      });
    });
  });

  after('close db connection', function() {
    // do nothing.
  });
});
