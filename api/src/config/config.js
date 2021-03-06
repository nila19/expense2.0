/* eslint no-magic-numbers: "off" */
'use strict';

import minimist from 'minimist';
import dotenv from 'dotenv';

// load env variables from .env
dotenv.config();

const argv = minimist(process.argv.slice(2));

const root = {
  port: process.env.PORT,
  dburl: process.env.MONGO_URL,
  dbName: process.env.DB_NAME,
  thinList: 200,
  pct75: 0.75,
  pct125: 1.25,
  forecastMonths: 3,
  error: 1000,
  pulse: {
    on: true,
    interval: 120000, // milliseconds
  },
  billCloser: false, // flag to run it as a startup process.
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
      threshold: 100, // milliseconds
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
  return { ...root, ...regions[region] };
};

export const config = loadConfig();
