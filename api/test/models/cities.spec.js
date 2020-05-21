/* eslint no-magic-numbers: "off", no-console: "off" */

'use strict';

import { should, use, expect } from 'chai';
import 'regenerator-runtime/runtime.js';

import { ping } from 'config/mongodb-config';

import { cityModel } from 'data/models';

should();
use(require('chai-things'));

describe('models.cities', () => {
  let db = null;

  before('get db connection', (done) => {
    ping().then((_db) => {
      db = _db;
      done();
    });
  });
  describe('findAllCities', () => {
    it('should fetch all cities', async () => {
      const _cities = await cityModel.findAll(db);
      _cities.should.contain.some.with.property('active', true);
      _cities.should.contain.some.with.property('active', false);
    });
  });
  describe('findActive', () => {
    it('should fetch active cities', async () => {
      const _cities = await cityModel.findActive(db);
      _cities.should.all.have.property('active', true);
    });
  });
  describe('findDefault', () => {
    it('should fetch default city', async () => {
      const city = await cityModel.findDefault(db);
      expect(city).to.have.property('default', true);
    });
  });

  after('close db connection', () => {
    // do nothing.
  });
});
