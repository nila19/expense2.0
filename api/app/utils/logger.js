'use strict';

const bunyan = require('bunyan');
// coloring console messages.
const chalk = require('chalk');
const config = require('../config/config');

const log = bunyan.createLogger({
  name: 'ExpenseTracker',
  streams: [{
    type: 'rotating-file',
    path: config.log.path,
    period: config.log.period,
    count: config.log.count
  }, {
      // log to console
    stream: process.stdout
  }],
  serializers: {
    req: bunyan.stdSerializers.req,
    res: bunyan.stdSerializers.res,
    err: bunyan.stdSerializers.err
  }
});

log.chalk = chalk;

module.exports = log;
