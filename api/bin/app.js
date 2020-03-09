'use strict';

// builds path variable.
import { join } from 'path';
// serve favicon.
import favicon from 'serve-favicon';
// request content Parsers.
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'body-parser';
// compresses the response..
import compression from 'compression';
// 'HTTP request' logging framework.
import morgan from 'morgan';
// blocking cross site attacks.
import helmet from 'helmet';
import express from 'express';

import { cache } from '../config/config';
import { routes } from '../config/route-config';
import { connect } from '../config/mongodb-config';
import logger from '../utils/logger';
import { errorHandler } from './handler';

// * TODO: make it run
// TODO: change to async/await
// TODO: change to mongoose
// TODO: Redo front-end with React
// TODO: Use Docker/Kube
// TODO: Add test cases
// TODO: Add CI/CD

// less than 400 are success codes.
const HTTP_SUCCESS = 400;
const ONE_YEAR = 31536000;

const app = express();

// mongodb connection
connect(app);

// store logger in app context for use from other components.
app.locals.log = logger;

// serving static files
const staticPath = join(__dirname, '../public');
const setCacheControl = res => {
  if (cache.on) {
    res.setHeader('Cache-Control', 'public, max-age=' + ONE_YEAR);
  }
};
const staticOptions = { setHeaders: setCacheControl };

const skipSuccess = (req, res) => res.statusCode < HTTP_SUCCESS;
const faviconPath = join(__dirname, '../public/images', 'favicon.ico');

app.set('views', join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');

// list of middleware in the order.
app.use(helmet());
app.use(compression());
app.use(morgan('dev', { skip: skipSuccess }));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(staticPath, staticOptions));
app.use(favicon(faviconPath));

// inject application routes.
routes(app);

// send error json
app.use(errorHandler);

export default app;
