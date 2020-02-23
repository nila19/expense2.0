"use strict";

// builds path variable.
const path = require("path");
// serve favicon.
const favicon = require("serve-favicon");
// request content Parsers.
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// compresses the response..
const compression = require("compression");
// 'HTTP request' logging framework.
const morgan = require("morgan");
// blocking cross site attacks.
const helmet = require("helmet");
const express = require("express");
const config = require("../config/config");

const app = express();

const httpSuccess = 400; // less than 400 are success codes.

const routes = require("../config/route-config");
const mongo = require("../config/mongodb-config");

const setCacheControl = function(res) {
  if (config.cache.on) {
    // set cache only for production.
    res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
  }
};

// store logger in app context for use from other components.
app.locals.log = require("../utils/logger");
mongo.connect(app);

app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "ejs");

// list of middleware in the order...
app.use(helmet());
app.use(compression());
app.use(
  morgan("dev", {
    skip: function(req, res) {
      return res.statusCode < httpSuccess;
    }
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  express.static(path.join(__dirname, "../../public"), {
    setHeaders: setCacheControl
  })
);
app.use(favicon(path.join(__dirname, "../../public/images", "favicon.ico")));

// inject application routes...
routes.route(app);

module.exports = app;
