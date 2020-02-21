'use strict';

const { Router } = require('express');
const router = new Router();

const Channel = require('./../models/channel');
const Post = require('./../models/post');
const Comment = require('./../models/comment');

const routeGuard = require('./../middleware/route-guard');

router.get('/create', routeGuard(true), (req, res, next) => {
  res.render('channel/create');
});

router.post('/create', routeGuard(true), (req, res, next) => {
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
        return Post.find({ channel: channelId })
          .populate('channel author')
          .limit(50);
      }
    })
    .then(posts => {
      res.render('channel/single', { channel, posts });
    })
    .catch(error => {
      next(error);
    });
});

router.get('/:channelId/post/create', routeGuard(true), (req, res, next) => {
  res.render('channel/create-post');
});

const uploader = require('./../multer-configure.js');

router.post(
  '/:channelId/post/create',
  routeGuard(true),
  uploader.array('photos', 10),
  (req, res, next) => {
    const { title, content } = req.body;
    const { channelId } = req.params;

    const urls = req.files.map(file => {
      return file.url;
    });

    const author = req.user._id;

    Post.create({
      title,
      content,
      channel: channelId,
      author,
      photos: urls
    })
      .then(post => {
        res.redirect(`/channel/${post.channel}/post/${post._id}`);
      })
      .catch(error => {
        next(error);
      });
  }
);

router.get('/:channelId/post/:postId', (req, res, next) => {
  const { postId } = req.params;

  let post;
  Post.findById(postId)
    .populate('channel author')
    .then(document => {
      post = document;
      if (!document) {
        return Promise.reject(new Error('NOT_FOUND'));
      } else {
        return Comment.find({ post: postId }).populate('author');
      }
    })
    .then(comments => {
      res.render('channel/single-post', { post, comments });
    })
    .catch(error => {
      next(error);
    });
});

router.get('/:channelId/post/:postId/edit', (req, res, next) => {
  const { postId } = req.params;

  Post.findOne({
    _id: postId,
    author: req.user._id
  })
    .then(post => {
      if (post) {
        res.render('channel/edit-post', { post });
      } else {
        next(new Error('NOT_FOUND'));
      }
    })
    .catch(error => {
      next(error);
    });
});

router.post('/:channelId/post/:postId/edit', routeGuard(true), (req, res, next) => {
  const { channelId, postId } = req.params;
  const { title, content } = req.body;

  Post.findOneAndUpdate(
    {
      _id: postId,
      author: req.user._id
    },
    {
      title,
      content
    }
  )
    .then(() => {
      res.redirect(`/channel/${channelId}/post/${postId}`);
    })
    .catch(error => {
      next(error);
    });
});

router.post('/:channelId/post/:postId/comment', routeGuard(true), (req, res, next) => {
  const { channelId, postId } = req.params;
  const { content } = req.body;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        return Promise.reject(new Error('NOT_FOUND'));
      } else {
        return Comment.create({
          post: postId,
          author: req.user._id,
          content
        });
      }
    })
    .then(() => {
      res.redirect(`/channel/${channelId}/post/${postId}`);
    })
    .catch(error => {
      next(error);
    });
});

module.exports = router;
