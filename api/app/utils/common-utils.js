'use strict';
const Promise = require('bluebird');
const cities = require('../models/Cities')();
const config = require('../config/config');

const buildParm = function (req) {
  return {
    db: req.app.locals.db,
    log: req.app.locals.log
  };
};

const logErr = function (log, err) {
  if(err) {
    log.error(err);
  }
};

const sendJson = function (promise, resp, log) {
  promise.then((data) => {
    return resp.json({code: 0, data: data});
  }).catch((err) => {
    log.error(err);
    return resp.json({code: config.error});
  });
};

const sendJsonEmbedNull = function (promise, resp, log) {
  promise.then((data) => {
    data.forEach(function (dt) {
      dt.bills = null;
    });
    return resp.json({code: 0, data: data});
  }).catch((err) => {
    log.error(err);
    return resp.json({code: config.error});
  });
};

const checkCityEditable = function (db, id) {
  return new Promise(function (resolve, reject) {
    cities.findById(db, id).then((city) => {
      return city.active ? resolve(true) : reject(new Error('City is not active.'));
    }).catch((err) => {
      reject(err);
    });
  });
};

const checkAccountsActive = function (finImpact, from, to) {
  return new Promise(function (resolve, reject) {
    if(!finImpact) {
      return resolve();
    } else if(from && from.id && !from.active) {
      return reject(new Error('Change invalid. Account(s) involved are not active...'));
    } else if(to && to.id && !to.active) {
      return reject(new Error('Change invalid. Account(s) involved are not active...'));
    } else {
      return resolve();
    }
  });
};

module.exports = {
  buildParm: buildParm,
  logErr: logErr,
  sendJson: sendJson,
  sendJsonEmbedNull: sendJsonEmbedNull,
  checkCityEditable: checkCityEditable,
  checkAccountsActive: checkAccountsActive
};
