/* eslint no-magic-numbers: "off" */
'use strict';

import _ from 'lodash';
import minimist from 'minimist';
import dotenv from 'dotenv';

// first step to load env variables from .env

// commented out for enabling docker-compose
// const result = dotenv.config();
// if (result.error) {
//   throw result.error;
// }

// load all env variables into envs
// const { parsed: envs } = result;
// console.log(result.parsed);

const argv = minimist(process.argv.slice(2));

const root = {
  port: process.env.PORT,
  dburl: process.env.MONGO_URL,
  dbName: process.env.DB_NAME,
  thinList: 100,
  pct75: 0.75,
  pct125: 1.25,
  error: 1000,
  pulse: {
    on: true,
    interval: 30000, // milliseconds
  },
  billCloser: true,
  blocked: {
    on: false,
  },
  cache: {
    on: false,
  },
  log: {
    path: process.env.LOG_PATH + '/expense-tracker.log',
    period: '1m',
    count: 12,
  },
};

const regions = {
  prod: {
    env: 'PROD',
    blocked: {
      on: true,
      threshold: 50, // milliseconds
    },
    cache: {
      on: true,
    },
  },
  dev: {
    env: 'DEV',
  },
};

const loadConfig = () => {
  const region = argv.region && regions[argv.region] ? argv.region : 'dev';
  return _.assign({}, root, regions[region]);
};

export default loadConfig();
