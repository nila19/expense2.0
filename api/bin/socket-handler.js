'use strict';

export const PIPE = {
  ACCOUNT: 'account',
  BILL: 'bill',
  TRANS: 'transaction'
};

let app = null;

export const onConnect = function(ap) {
  app = ap;
};

export const publish = function(pipe, data) {
  if (app && app.locals) {
    app.locals.io.emit(pipe, { code: 0, data: data });
  }
};
