'use strict';

const inject404 = function () {
  return function (req, res, next) {
    const code = 404;
    const err = new Error('Not Found');

    err.status = code;
    next(err);
  };
};

const handler = function () {
  return function (err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }
    const code = 500;
    const view = 'error';

    // set locals, only providing error in development
    res.locals.error = {};
    if (req.app.get('env') === 'development') {
      res.locals.error = err;
    }
    res.locals.message = err.message;
    res.status(err.status || code);
    res.render(view);
    return true;
  };
};

// middleware function to inject 404 if no prior route is able to service this request.
module.exports.inject404 = inject404;
module.exports.handler = handler;
