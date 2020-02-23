'use strict';

const monk = require('monk');
const config = require('./config');
const billcloser = require('../services/BillCloserService');

let okToLog = true;
let billclosed = false;

const ping = function (log, next) {
  monk(config.dburl).then((db) => {
    if (okToLog && log && log.info) {
      log.info('Connected to :: ' + config.dburl);
    }
    next(null, db);
  }).catch((err) => {
    if (log && log.error) {
      log.error(log.chalk.magenta(err));
    }
    next(err);
  });
};

const connect = function (app) {
  ping(app.locals.log, function (err, db) {
    // if connection error, print next connect msg.
    okToLog = Boolean(err);
    app.locals.db = db;
    // ensure billcloser runs only one time for every server start.
    if (!err && config.billcloser && !billclosed) {
      billcloser.execute({db: app.locals.db, log: app.locals.log});
      billclosed = true;
    }
  });
  // keep trying every x seconds.
  if (config.pulse.on) {
    setTimeout(connect, config.pulse.interval, app);
  }
};

module.exports = {
  connect: connect,
  ping: ping
};
