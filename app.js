'use strict';

const { join } = require('path');
const express = require('express');
const mongoose = require('mongoose');
const createError = require('http-errors');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');

const MongoStore = connectMongo(expressSession);

const indexRouter = require('./routes/index');
const channelRouter = require('./routes/channel');
const profileRouter = require('./routes/profile');
const authenticationRouter = require('./routes/authentication');

const hbs = require('hbs');

const app = express();

app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

const handlebarsHelperDate = require('helper-date');

hbs.registerHelper('date', handlebarsHelperDate);
hbs.registerPartials(join(__dirname, 'views/partials'));

app.use(serveFavicon(join(__dirname, 'public/images', 'favicon.ico')));
app.use(
  sassMiddleware({
    src: join(__dirname, 'public'),
    dest: join(__dirname, 'public'),
    outputStyle: process.env.NODE_ENV === 'development' ? 'nested' : 'compressed',
    force: process.env.NODE_ENV === 'development',
    sourceMap: true
  })
);
app.use(express.static(join(__dirname, 'public')));

app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 60 * 60
    })
  })
);

const deserializeUserMiddleware = require('./middleware/deserialize-user');
const provideUserToTemplates = require('./middleware/provide-user-to-template');

app.use(deserializeUserMiddleware);
app.use(provideUserToTemplates);

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);
app.use('/channel', channelRouter);
app.use('/profile', profileRouter);
app.use('/authentication', authenticationRouter);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

const catchAllErrorHandler = require('./middleware/catch-all-error-handler');

// Catch all error handler
app.use(catchAllErrorHandler);

module.exports = app;
