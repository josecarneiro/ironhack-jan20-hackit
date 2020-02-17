'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 80,
    trim: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  }
});

const Model = mongoose.model('Post', schema);

module.exports = Model;
