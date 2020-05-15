'use strict';

import firebase from 'firebase';
import _ from 'lodash';

import config from 'config/config';

let okToLog = true;

export const connect = (app) => {
  ping(app);
  // keep trying every x seconds.
  // if (config.pulse.on) {
  //   setTimeout(connect, config.pulse.interval, app);
  // }
};

const ping = (app) => {
  const { log } = app.locals;
  const { apiKey, authDomain, projectId } = config;

  try {
    firebase.initializeApp({
      apiKey: apiKey,
      authDomain: authDomain,
      projectId: projectId,
    });
    app.locals.firebase = firebase.firestore();
    if (okToLog && log && log.info) {
      log.info('Connected to Firebase => ' + authDomain);
    }
    okToLog = false;
  } catch (error) {
    if (okToLog && log && log.info) {
      log.error('Error connecting to Firebase => ' + authDomain + ' => ' + error);
    }
    okToLog = true;
  }
};
