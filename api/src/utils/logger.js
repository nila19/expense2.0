'use strict';

import { createLogger, stdSerializers } from 'bunyan';
// coloring console messages.
import chalk from 'chalk';

import { config } from 'config/config';

const logger = createLogger({
  name: 'ExpenseTracker',
  streams: [
    {
      type: 'rotating-file',
      path: config.log.path,
      period: config.log.period,
      count: config.log.count,
    },
    {
      // log to console
      stream: process.stdout,
    },
  ],
  serializers: {
    req: stdSerializers.req,
    res: stdSerializers.res,
    err: stdSerializers.err,
  },
});

logger.chalk = chalk;

export { logger };
