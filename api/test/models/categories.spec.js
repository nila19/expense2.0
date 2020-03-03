/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';
import { should, use } from 'chai';

import Categories from '../../models/Categories';
import { ping } from '../../config/mongodb-config.js';

should();
use(require('chai-things'));

const categories = Categories();

describe('models.categories', function() {
  const cityId = 20140301;
  let db = null;

  before('get db connection', function(done) {
    ping(null, function(err, db1) {
      db = db1;
      done();
    });
  });
  describe('findForCity', function() {
    it('should fetch all categories', function(done) {
      categories.findForCity(db, cityId).then(cats => {
        cats.should.all.have.property('cityId', cityId);
        done();
      });
    });
  });

  after('close db connection', function() {
    // do nothing.
  });
});
