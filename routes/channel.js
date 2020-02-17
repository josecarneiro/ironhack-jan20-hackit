'use strict';

const { Router } = require('express');
const router = new Router();

const Channel = require('./../models/channel');
const Post = require('./../models/post');

router.get('/create', (req, res, next) => {
  res.render('channel/create');
});

router.post('/create', (req, res, next) => {
  const { name } = req.body;
  Channel.create({
    name
  })
    .then(channel => {
      res.redirect(`/channel/${channel._id}`);
    })
    .catch(error => {
      next(error);
    });
});

router.get('/:channelId', (req, res, next) => {
  // const { channelId } = req.params;
  const channelId = req.params.channelId;

  let channel;

  Channel.findById(channelId)
    .then(document => {
      if (!document) {
        next(new Error('NOT_FOUND'));
      } else {
        channel = document;
        return Post.find({ channel: channelId }).limit(50);
      }
    })
    .then(posts => {
      console.log(channel);
      console.log(posts);
      res.render('channel/single', { channel, posts });
    })
    .catch(error => {
      next(error);
    });
});

router.get('/:channelId/post/create', (req, res, next) => {
  res.render('channel/create-post');
});

router.post('/:channelId/post/create', (req, res, next) => {
  const { title, content } = req.body;
  const { channelId } = req.params;

  Post.create({
    title,
    content,
    channel: channelId
  })
    .then(post => {
      res.redirect(`/channel/${post.channel}/post/${post._id}`);
    })
    .catch(error => {
      next(error);
    });
});

router.get('/:channelId/post/:postId', (req, res, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .populate('channel')
    .then(post => {
      if (!post) {
        next(new Error('NOT_FOUND'));
      } else {
        console.log(post);
        res.render('channel/single-post', { post });
      }
    })
    .catch(error => {
      next(error);
    });
});

module.exports = router;
