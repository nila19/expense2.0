/* eslint no-magic-numbers: "off" */
'use strict';

const argv = require('minimist')(process.argv.slice(2));

const root = {
  thinList: 100,
  pct75: 0.75,
  pct125: 1.25,
  error: 1000,
  pulse: {
    on: true,
    interval: 30000 // milliseconds
  },
  billcloser: false,
  blocked: {
    on: false,
  },
  cache: {
    on: false,
  },
};

const regions = {
  prod: {
    env: 'PROD',
    port: process.env.PORT,
    dburl: process.env.MONGO_URL,
    billcloser: true,
    blocked: {
      on: true,
      threshold: 50 // milliseconds
    },
    cache: {
      on: true,
    },
    log: {
      path: process.env.LOG_PATH + '/expense-tracker.log',
      period: '1m',
      count: 12
    },
  },
  dev: {
    env: 'DEV',
    port: process.env.PORT,
    dburl: process.env.MONGO_URL,
    billcloser: true,
    log: {
      path: process.env.LOG_PATH + '/expense-tracker.log',
      period: '1m',
      count: 12
    },
  },
};

const cfg = {};
const loadConfig = function () {
  const region = (argv.region && regions[argv.region]) ? argv.region : 'dev';

  Object.assign(cfg, root, regions[region]);
};

loadConfig();

module.exports = cfg;
