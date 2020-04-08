/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';
import { should, use } from 'chai';

import { categories } from '../../models/index';

import { ping } from '../../config/mongodb-config.js';

should();
use(require('chai-things'));

describe('models.categories', () => {
  const cityId = 20140301;
  let db = null;

  before('get db connection', (done) => {
    ping(null, (err, db1) => {
      db = db1;
      done();
    });
  });
  describe('findForCity', () => {
    it('should fetch all categories', async () => {
      const cats = await categories.findForCity(db, cityId);
      cats.should.all.have.property('cityId', cityId);
    });
  });

  after('close db connection', () => {
    // do nothing.
  });
});
