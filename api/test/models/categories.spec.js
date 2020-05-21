/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';

import { should, use } from 'chai';
import 'regenerator-runtime/runtime.js';

import { ping } from 'config/mongodb-config';

import { categoryModel } from 'data/models';

should();
use(require('chai-things'));

describe('models.categories', () => {
  const cityId = 20140301;
  let db = null;

  before('get db connection', (done) => {
    ping().then((_db) => {
      db = _db;
      done();
    });
  });
  describe('findForCity', () => {
    it('should fetch all categories', async () => {
      const cats = await categoryModel.findForCity(db, cityId);
      cats.should.all.have.property('cityId', cityId);
    });
  });

  after('close db connection', () => {
    // do nothing.
  });
});
