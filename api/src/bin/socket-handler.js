'use strict';

export const PIPE = {
  ACCOUNT: 'account',
  BILL: 'bill',
  TRANS: 'transaction',
};

export const STATE = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED',
};

let app = null;

export const onConnect = (_app) => {
  app = _app;
};

export const publish = (pipe, data, state) => {
  if (app && app.locals) {
    app.locals.io.emit(pipe, { code: 0, state: state, data: data });
  }
};
