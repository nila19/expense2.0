/* eslint no-process-exit: "off"*/
'use strict';

import { config } from 'config/config';

export const onError = (err, app) => {
  if (err.syscall !== 'listen') {
    throw err;
  }
  const port = 'Port : ' + app.get('port');
  const { log } = app.locals;

  // handle specific listen errors with friendly messages
  switch (err.code) {
    case 'EACCES':
      log.error(log.chalk.magenta(port + ' requires elevated privileges'));
      process.exit(1);
    case 'EADDRINUSE':
      log.error(log.chalk.magenta(port + ' is already in use'));
      process.exit(1);
    default:
      throw err;
  }
};

export const onListening = (app) => {
  app.locals.log.info('Listening on port => ' + app.get('port') + '; DB => ' + config.dburl);
};

export const unCaught = (err, app) => {
  const { log } = app.locals;
  log.error(log.chalk.magenta('** Uncaught Handler... **'));
  log.error(err.stack);
  log.error(err);
};

export const errorHandler = (err, req, res) => {
  console.error(err);
  req.app.locals.log.error(err);
  res.status(500).json({ code: config.error, msg: err });
};
