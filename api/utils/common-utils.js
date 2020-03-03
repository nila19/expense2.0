'use strict';

import Promise from 'bluebird';

import { cities } from '../models';

import { error } from '../config/config';

export const buildParm = req => {
  return {
    db: req.app.locals.db,
    log: req.app.locals.log
  };
};

export const logErr = (log, err) => {
  if (err) {
    log.error(err);
  }
};

export const sendJson = (promise, resp, log) => {
  promise
    .then(data => {
      return resp.json({ code: 0, data: data });
    })
    .catch(err => {
      log.error(err);
      return resp.json({ code: error });
    });
};

export const sendJsonEmbedNull = (promise, resp, log) => {
  promise
    .then(data => {
      data.forEach(datum => (datum.bills = null));
      return resp.json({ code: 0, data: data });
    })
    .catch(err => {
      log.error(err);
      return resp.json({ code: error });
    });
};

export const checkCityEditable = (db, id) => {
  return new Promise((resolve, reject) => {
    cities
      .findById(db, id)
      .then(city => {
        return city.active ? resolve(true) : reject(new Error('City is not active.'));
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const checkAccountsActive = (finImpact, from, to) => {
  return new Promise((resolve, reject) => {
    if (!finImpact) {
      return resolve();
    } else if (from && from.id && !from.active) {
      return reject(new Error('Change invalid. Account(s) involved are not active...'));
    } else if (to && to.id && !to.active) {
      return reject(new Error('Change invalid. Account(s) involved are not active...'));
    } else {
      return resolve();
    }
  });
};
