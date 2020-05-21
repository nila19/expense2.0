'use strict';

import firebase from 'firebase';
import _ from 'lodash';

import { config } from 'config/config';

export const connect = (app) => {
  ping(app);
};

const ping = (app) => {
  const { log } = app.locals;
  const { apiKey, authDomain, projectId } = config;

  try {
    firebase.initializeApp({ apiKey, authDomain, projectId });
    app.locals.firebase = firebase.firestore();
    if (log && log.info) {
      log.info('Connected to Firebase => ' + authDomain);
    }
  } catch (error) {
    log.error('Error connecting to Firebase => ' + authDomain + ' => ' + error);
  }
};
