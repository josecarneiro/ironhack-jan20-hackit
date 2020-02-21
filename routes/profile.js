'use strict';

const { Router } = require('express');
const router = new Router();

const User = require('./../models/user');
const Post = require('./../models/post');

const routeGuard = require('./../middleware/route-guard');

router.get('/edit', (req, res, next) => {
  res.render('profile/edit');
});

router.post('/edit', routeGuard(true), (req, res, next) => {
  const userId = req.user._id;
  const { name } = req.body;

  User.findByIdAndUpdate(userId, {
    name
  })
    .then(() => {
      res.redirect('/');
    })
    .catch(error => {
      next(error);
    });
});

router.get('/:userId', (req, res, next) => {
  const { userId } = req.params;
  let user;

  User.findById(userId)
    .then(document => {
      user = document;
      if (document) {
        return Post.find({ author: userId }).populate('channel author');
      } else {
        next(new Error('USER_NOT_FOUND'));
      }
    })
    .then(posts => {
      const isOwnProfile = req.user && req.user._id.toString() === user._id.toString();
      res.render('profile/single', { profile: user, posts, isOwnProfile });
    })
    .catch(error => {
      next(error);
    });
});

module.exports = router;
