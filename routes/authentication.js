'use strict';

const { Router } = require('express');
const router = new Router();

const User = require('./../models/user');
const bcryptjs = require('bcryptjs');

router.get('/sign-in', (req, res, next) => {
  res.render('authentication/sign-in');
});

router.post('/sign-in', (req, res, next) => {
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
        next(new Error('USER_NOT_FOUND'));
      }
    })
    .then(result => {
      if (result) {
        // Set the session for the user
        req.session.userId = user._id;
        res.redirect('/');
      } else {
        next(new Error('WRONG_PASSWORD'));
      }
    })
    .catch(error => {
      next(error);
    });
});

router.get('/sign-up', (req, res, next) => {
  res.render('authentication/sign-up');
});

router.post('/sign-up', (req, res, next) => {
  const { email, name, password } = req.body;
  User.findOne({
    email
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

router.post('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
