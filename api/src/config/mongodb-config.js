'use strict';

import { MongoClient } from 'mongodb';

import { config } from 'config/config';

import { executeBillClosure } from 'services/bill/bill-closer-service';

let okToLog = true;
let billClosed = false;

export const connect = (app) => {
  const log = app.locals.log;
  ping()
    .then((db) => setDatabase(app, db, log))
    .catch((err) => {
      log.info('Error connecting to MongoDB - ' + config.dburl + ' ==> ' + err);
      okToLog = true;
    });

  // keep trying every x seconds.
  if (config.pulse.on) {
    setTimeout(connect, config.pulse.interval, app);
  }
};

export const ping = async () => {
  const client = new MongoClient(config.dburl, { useUnifiedTopology: true, useNewUrlParser: true });
  await client.connect();
  return client.db(config.dbName);
};

const setDatabase = (app, db, log) => {
  app.locals.db = db;
  if (okToLog) {
    log.info('Connected to MongoDB - ' + config.dburl + '/' + config.dbName);
  }
  okToLog = false;
  // ensure billCloser runs only one time for every server start.
  if (config.billCloser && !billClosed) {
    executeBillClosure({ db, log });
    billClosed = true;
  }
};
