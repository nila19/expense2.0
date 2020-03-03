'use strict';

import monk from 'monk';

import config from './config';
import { execute } from '../services/bill-closer-service';

let okToLog = true;
let billClosed = false;

export const connect = app => {
  ping(app.locals.log, (err, db) => setDatabase(err, db, app));

  // keep trying every x seconds.
  if (config.pulse.on) {
    setTimeout(connect, config.pulse.interval, app);
  }
};

//TODO: convert to async/await
export const ping = (log, next) => {
  monk(config.dburl)
    .then(db => {
      if (okToLog && log && log.info) {
        log.info('Connected to :: ' + config.dburl);
      }
      next(null, db);
    })
    .catch(err => {
      if (log && log.error) {
        log.error(log.chalk.magenta(err));
      }
      next(err);
    });
};

const setDatabase = (err, db, app) => {
  // if connection error, print next connect msg.
  okToLog = Boolean(err);
  app.locals.db = db;
  // ensure billCloser runs only one time for every server start.
  if (!err && config.billCloser && !billClosed) {
    execute({ db: app.locals.db, log: app.locals.log });
    billClosed = true;
  }
};
