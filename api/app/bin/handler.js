/* eslint no-process-exit: "off"*/
'use strict';

const config = require('../config/config');

const onError = function (err, app) {
  if (err.syscall !== 'listen') {
    throw err;
  }
  const port = 'Port : ' + app.get('port');
  const log = app.locals.log;

  // handle specific listen errors with friendly messages
  switch (err.code) {
    case 'EACCES':
      log.error(log.chalk.magenta(port + ' requires elevated privileges'));
      process.exit(1);
      break;
    case 'EADDRINUSE':
      log.error(log.chalk.magenta(port + ' is already in use'));
      process.exit(1);
      break;
    default:
      throw err;
  }
};

const onListening = function (app) {
  app.locals.log.info('Listening on port :: ' + app.get('port') + ' DB :: ' + config.dburl);
};

const unCaught = function (err, app) {
  const log = app.locals.log;

  log.error(log.chalk.magenta('** Uncaught Handler... **'));
  log.error(err.stack);
  log.error(err);
};

module.exports = {
  onError: onError,
  onListening: onListening,
  unCaught: unCaught
};
