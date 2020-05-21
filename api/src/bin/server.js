'use strict';

import { createServer } from 'http';
import blockedIo from 'blocked';
import socketIo from 'socket.io';

import { app } from 'bin/app';
import { onError, onListening, unCaught } from 'bin/handler';
import { onConnect } from 'bin/socket-handler';
import { config } from 'config/config';

const server = createServer(app);
const io = socketIo(server);

const { port, blocked } = config;

// store io in app context for use from other components.
app.locals.io = io;
app.set('port', port);
server.listen(port);

// pass-through methods since unable to pass port# from event handler.
server.on('error', (err) => onError(err, app));
server.on('listening', () => onListening(app));
io.on('connection', () => onConnect(app));

const { log } = app.locals;
const logBlocked = (ms) => log.warn(log.chalk.cyan(new Date() + ' :: CPU blocked - %sms', ms || 0));

// pings server every 100ms & look for process blockages. Logs if the wait time goes more than the threshold.
if (blocked?.on) {
  blockedIo(logBlocked, { threshold: blocked.threshold });
}

// bad practice to catch the uncaught exception...
process.on('uncaughtException', (err) => unCaught(err, app));
