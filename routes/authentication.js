'use strict';

const { Router } = require('express');
const router = new Router();

const User = require('./../models/user');
const bcryptjs = require('bcryptjs');
const routeGuard = require('./../middleware/route-guard');

router.get('/sign-in', routeGuard(false), (req, res, next) => {
  res.render('authentication/sign-in');
});

router.post('/sign-in', routeGuard(false), (req, res, next) => {
  const { email, password } = req.body;
  let user;
  User.findOne({
    email
  })
    .then(document => {
      user = document;
      if (document) {
        return bcryptjs.compare(password, document.passwordHashAndSalt);
      } else {
        return Promise.reject(new Error('USER_NOT_FOUND'));
      }
    })
    .then(result => {
      if (result) {
        // Set the session for the user
        req.session.userId = user._id;
        res.redirect('/');
      } else {
        return Promise.reject(new Error('WRONG_PASSWORD'));
      }
    })
    .catch(error => {
      next(error);
    });
});

router.get('/sign-up', routeGuard(false), (req, res, next) => {
  res.render('authentication/sign-up');
});

router.post('/sign-up', routeGuard(false), (req, res, next) => {
  const { email, name, password } = req.body;

  Promise.resolve()
    .then(() => {
      if (new RegExp('^(?=.*[A-Za-z])(?=.*d)[A-Za-zd]{8,}$').test(password)) {
        return User.findOne({
          email
        });
      } else {
        return Promise.reject(new Error('PASSWORD_INSECURE'));
      }
    })
    .then(user => {
      if (user) {
        next(new Error('USER_ALREADY_EXISTS'));
      } else {
        return bcryptjs.hash(password, 10);
      }
    })
    .then(hash => {
      return User.create({
        email,
        name,
        passwordHashAndSalt: hash
      });
    })
    .then(user => {
      // Set the session after user has created account
      req.session.userId = user._id;
      res.redirect('/');
    })
    .catch(error => {
      next(error);
    });
});

router.post('/sign-out', routeGuard(true), (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
