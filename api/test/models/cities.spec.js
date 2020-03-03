/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';
import { should, use, expect } from 'chai';

import Cities from '../../models/Cities';
import { ping } from '../../config/mongodb-config.js';

should();
use(require('chai-things'));

const cities = Cities();

describe('models.cities', function() {
  let db = null;

  before('get db connection', function(done) {
    ping(null, function(err, db1) {
      db = db1;
      done();
    });
  });
  describe('findAllCities', function() {
    it('should fetch all cities', function(done) {
      cities.findAllCities(db).then(_cities => {
        _cities.should.contain.some.with.property('active', true);
        _cities.should.contain.some.with.property('active', false);
        done();
      });
    });
  });
  describe('findActive', function() {
    it('should fetch active cities', function(done) {
      cities.findActive(db).then(_cities => {
        _cities.should.all.have.property('active', true);
        done();
      });
    });
  });
  describe('findDefault', function() {
    it('should fetch default city', function(done) {
      cities.findDefault(db).then(city => {
        expect(city).to.have.property('default', true);
        done();
      });
    });
  });

  after('close db connection', function() {
    // do nothing.
  });
});
