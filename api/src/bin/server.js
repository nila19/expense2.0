'use strict';

import { createServer } from 'http';
// monitoring process blockages.
import blocked from 'blocked';
import socketIo from 'socket.io';

import { app } from 'bin/app';
import { onError, onListening, unCaught } from 'bin/handler';
import { onConnect } from 'bin/socket-handler';
import config from 'config/config';

const server = createServer(app);
const io = socketIo(server);

const port = config.port;
const _blocked = config.blocked;

// store io in app context for use from other components.
app.locals.io = io;
app.set('port', port);
server.listen(port);

// pass-through methods since unable to pass port# from event handler.
server.on('error', (err) => onError(err, app));
server.on('listening', () => onListening(app));
io.on('connection', () => onConnect(app));

const log = app.locals.log;
const logBlocked = (ms) => log.warn(log.chalk.cyan(new Date() + ' :: CPU blocked - %sms', ms || 0));

// pings server every 100ms & look for process blockages. Logs if the wait time goes more than the threshold.
if (_blocked && _blocked.on) {
  blocked(logBlocked, { threshold: _blocked.threshold });
}

// bad practice to catch the uncaught exception...
process.on('uncaughtException', (err) => unCaught(err, app));
