'use strict';

// middleware function to inject 404 if no prior route is able to service this request.

export const inject404 = () => {
  return (req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  };
};

export const handler = () => {
  return (err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }

    const view = 'error';
    // set locals, only providing error in development
    res.locals.error = {};
    if (req.app.get('env') === 'development') {
      res.locals.error = err;
    }
    res.locals.message = err.message;
    res.status(err.status || 500);
    res.render(view);
    return true;
  };
};
