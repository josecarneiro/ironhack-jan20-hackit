'use strict';

const { Router } = require('express');
const router = new Router();

const Channel = require('./../models/channel');
const Post = require('./../models/post');

router.get('/', (req, res, next) => {
  let channels;

  Channel.find()
    .limit(10)
    .then(documents => {
      channels = documents;
      return Post.find()
        .populate('channel author')
        .limit(20);
    })
    .then(posts => {
      res.render('home', { posts, popularChannels: channels });
    })
    .catch(error => {
      next(error);
    });
});

module.exports = router;
