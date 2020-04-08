/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';
import { should, use, expect } from 'chai';

import { sequences } from '../../models/index';
import { ping } from '../../config/mongodb-config.js';

should();
use(require('chai-things'));

describe('models.sequences', () => {
  const cityId = 20140301;
  const table = 'transactions';
  let db = null;

  before('get db connection', (done) => {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('getNextSeq', () => {
    let oldSeq = 0;

    before('backup db values', async () => {
      const seqs = await sequences.find(db, { cityId: cityId, table: table });
      oldSeq = seqs[0].seq;
    });
    it('should get next sequence', async () => {
      let seq = await sequences.findOneAndUpdate(db, { cityId: cityId, table: table });
      expect(seq.value).to.have.property('seq', oldSeq + 1);

      seq = await sequences.findOneAndUpdate(db, { cityId: cityId, table: table });
      expect(seq.value).to.have.property('seq', oldSeq + 2);
    });
    after('restore db values', async () => {
      await sequences.updateOne(db, { cityId: cityId, table: table }, { $set: { seq: oldSeq } });
    });
  });

  after('close db connection', () => {
    // do nothing.
  });
});
