'use strict';

import { MongoClient } from 'mongodb';

import config from './config';
import { executeBillClosure } from '../services/bill-closer-service';

let okToLog = true;
let billClosed = false;

export const connect = (app) => {
  ping(app.locals.log, (err, db) => setDatabase(err, db, app));

  // keep trying every x seconds.
  if (config.pulse.on) {
    setTimeout(connect, config.pulse.interval, app);
  }
};

//TODO: convert to async/await
export const ping = (log, next) => {
  const client = new MongoClient(config.dburl, { useUnifiedTopology: true, useNewUrlParser: true });

  client.connect((err) => {
    if (okToLog && log && log.info) {
      if (!err) {
        log.info('Connected to :: ' + config.dburl);
      } else {
        log.info('Error connecting to DB - ' + err);
      }
    }
    const db = client.db(config.dbName);
    console.log('Created connection...');
    next(err, db);
  });
};

const setDatabase = (err, db, app) => {
  // if connection error, print next connect msg.
  okToLog = Boolean(err);
  app.locals.db = db;
  // ensure billCloser runs only one time for every server start.
  if (!err && config.billCloser && !billClosed) {
    executeBillClosure({ db: app.locals.db, log: app.locals.log });
    billClosed = true;
  }
};
