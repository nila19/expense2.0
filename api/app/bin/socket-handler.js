'use strict';

const PIPE = {
  ACCOUNT: 'account',
  BILL: 'bill',
  TRANS: 'transaction'
};
let app = null;

const onConnect = function (ap) {
  app = ap;
};

const publish = function (pipe, dt) {
  if (app && app.locals) {
    app.locals.io.emit(pipe, {code: 0, data: dt});
  }
};

module.exports = {
  onConnect: onConnect,
  publish: publish,
  PIPE: PIPE
};
